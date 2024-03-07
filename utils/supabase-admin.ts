import { getOgTitle, getURL, postData, toDateTime } from './helpers';
import { stripe } from './stripe';
import logger from '@/logger';
import { Leap } from '@leap-ai/workflows';
import { createClient } from '@supabase/supabase-js';
import { APIClient, SendEmailRequest } from 'customerio-node';
import { jsonrepair } from 'jsonrepair';
import Stripe from 'stripe';
import type { Database } from 'types_db';
import { v4 as uuid } from 'uuid';

const customerio_client = new APIClient(
  process.env.CUSTOMERIO_API_KEY as string
);
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];

const leap = new Leap({
  apiKey: process.env.LEAP_API_KEY as string
});

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error } = await supabaseAdmin.from('products').upsert([productData]);
  if (error) throw error;
  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? null,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata
  };

  const { error } = await supabaseAdmin.from('prices').upsert([priceData]);
  if (error) throw error;
  console.log(`Price inserted/updated: ${price.id}`);
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', uuid)
    .single();
  if (error || !data?.stripe_customer_id) {
    // No customer record found, let's create one.
    const customerData: { metadata: { supabaseUUID: string }; email?: string } =
      {
        metadata: {
          supabaseUUID: uuid
        }
      };
    if (email) customerData.email = email;
    const customer = await stripe.customers.create(customerData);
    // Now insert the customer ID into our Supabase mapping table.
    const { error: supabaseError } = await supabaseAdmin
      .from('customers')
      .insert([{ id: uuid, stripe_customer_id: customer.id }]);
    if (supabaseError) throw supabaseError;
    console.log(`New customer created and inserted for ${uuid}.`);
    return customer.id;
  }
  return data.stripe_customer_id;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', uuid);
  if (error) throw error;
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData: Database['public']['Tables']['subscriptions']['Insert'] =
    {
      id: subscription.id,
      user_id: uuid,
      metadata: subscription.metadata,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      //TODO check quantity on subscription
      // @ts-ignore
      quantity: subscription.quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at
        ? toDateTime(subscription.cancel_at).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? toDateTime(subscription.canceled_at).toISOString()
        : null,
      current_period_start: toDateTime(
        subscription.current_period_start
      ).toISOString(),
      current_period_end: toDateTime(
        subscription.current_period_end
      ).toISOString(),
      created: toDateTime(subscription.created).toISOString(),
      ended_at: subscription.ended_at
        ? toDateTime(subscription.ended_at).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? toDateTime(subscription.trial_start).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? toDateTime(subscription.trial_end).toISOString()
        : null
    };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (error) throw error;
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
};

const UploadCSV = async (csv: File) => {
  const id = uuid();
  const filePath = `public/${id}.csv`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('documents')
    .upload(filePath, csv);

  if (uploadError) throw uploadError;

  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('documents')
    .insert([
      {
        id,
        storage_path: filePath
      }
    ]);

  if (insertError) throw insertError;

  return insertData;
};

const upsertLeads = async (id: string, Leads: any[]) => {
  try {
    const leads = Leads.map((lead) => ({
      document_id: id,
      ...lead
    }));

    const { data: leadInsertData, error: leadInsertError } = await supabaseAdmin
      .from('leads')
      .upsert(leads);

    if (leadInsertError) {
      throw leadInsertError;
    }

    console.log('Leads upserted successfully:', leadInsertData);
  } catch (error) {
    console.error('Error upserting leads:', error);
  }
};

const onUpload = async (document_id: string, user_email: string) => {
  const { data: doc, error: documentsError } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', document_id)
    .single();

  if (!doc) {
    return;
  }

  if (!doc.slack_notified) {
    if (
      doc.total_leads >= Number(process.env.ZAPIER_SLACK_EMAIL_LIMIT || 5000)
    ) {
      fetch(process.env.ZAPIER_SLACK_WEBHOOK as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `${
            user_email || 'Someone (not signed in)'
          } tried to upload a document with ${
            doc.total_leads
          } emails.\nDocumentID of the file they uploaded: ${document_id} \nYour current limit is set to: ${Number(
            process.env.ZAPIER_SLACK_EMAIL_LIMIT || 5000
          )}`,
          channel: '#studio-knowmore'
        })
      });
    }
  }
};
/**
 * This function is called when a document has been paid for
 * It updates the document to be paid and sends an email to the customer
 * It also triggers the leap workflow to process the leads
 *
 * @param document_id - the id of the document that has been paid for
 * @param customer_email - the email of the customer who paid for the document
 * @returns - the updated document
 */
const onPaid = async (document_id: string, customer_email: string) => {
  try {
    logger.info(`Updating document ${document_id} to be paid`);
    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('documents')
      .update({
        paid: true,
        processed: false,
        customer_to_email: customer_email
      })
      .eq('id', document_id);

    logger.info(`Updated document ${document_id} to be paid`);

    const { data: leadData, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('email')
      .eq('document_id', document_id);

    if (!leadData) {
      throw leadError;
    }

    logger.info(`Sending (processing leads) email to ${customer_email}`);

    const request = new SendEmailRequest({
      transactional_message_id: '3',
      message_data: {
        lead_count: leadData.length
      },
      identifiers: {
        id: document_id
      },
      to: customer_email,
      from: 'omar@knowmore.bot'
    });

    await customerio_client
      .sendEmail(request)
      .then((res: any) =>
        logger.info(`Sent processing leads to ${customer_email}, ${res}`)
      )
      .catch((err: any) => logger.error(err.statusCode, err.message));

    if (documentError) {
      throw documentError;
    }

    // batch code
    for (let i = 0; i < leadData.length; i += 200) {
      const leads = leadData.slice(i, i + 200);
      postData({
        url: `${getURL()}/api/leap/process-emails`,
        data: {
          document_id,
          leads
        }
      });
    }
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

const processEmails = async (document_id: string, leadData: any) => {
  const workflow_id = process.env.LEAP_WORKFLOW_ID || 'wkf_Z2NKhgEKaL1UIL';
  logger.info(
    `Starting leap workflows for document: ${document_id} with workflow: ${workflow_id}`
  );

  for (const lead in leadData) {
    const { email } = leadData[lead];

    logger.info(`Starting leap workflows for lead number ${lead}: ${email}`);

    // first check if email already exists in profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email);

    if (profileError) {
      throw profileError;
    }

    if (!profileData || profileData.length == 0) {
      const website = `https://${email.split('@')[1]}`;

      const title = await getOgTitle(website);
      const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');

      logger.info(
        `Starting leap workflows for lead: ${lead}, with query:, ${
          name + ' ' + title
        } `
      );

      const leap_webhook_url = process.env.LEAP_WEBHOOK_URL;

      if (leap_webhook_url) console.log('leap_webhook_url:', leap_webhook_url);

      const run = leap.workflowRuns.workflow({
        workflow_id,
        webhook_url: leap_webhook_url ?? `${getURL()}/api/leap/webhook`,
        input: {
          email_of_lead: email,
          search_input: name,
          user_website: title,
          document_id: document_id
        }
      });

      logger.info(`Started leap workflows for lead: ${lead}`);

      logger.info(`Updating lead to be unprocessed`);

      const { data: leadUpdateData, error: leadUpdateError } =
        await supabaseAdmin
          .from('leads')
          .update({
            processed: false
          })
          .eq('email', email);

      if (leadUpdateError) {
        throw leadUpdateError;
      }

      logger.info('lead updated successfully:', leadUpdateData);

      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      logger.info(`Lead already exists in profiles: ${email}`);

      const { data: leadUpdateData, error: leadUpdateError } =
        await supabaseAdmin
          .from('leads')
          .update({
            processed: true
          })
          .eq('email', email)
          .eq('document_id', document_id);

      if (leadUpdateError) throw leadUpdateError;
    }
  }
};

/**
 * This function checks if all the leads in a document have been processed
 *
 * @returns updatedDocs - the documents that have been updated
 */
const checkProcessed = async (): Promise<any[]> => {
  logger.info('checking if unprocessed documents have finished processing');

  const { data: unprocessedDocuments, error: unprocessedDocumentsError } =
    await supabaseAdmin.from('documents').select('*').eq('processed', false);

  logger.info(`unprocessed documents found ${unprocessedDocuments?.length}`);

  if (unprocessedDocumentsError) {
    throw unprocessedDocumentsError;
  }

  const updatedDocs: any[] = [];

  for (const doc of unprocessedDocuments) {
    const { data: unprocessedLeads, error: unprocessedLeadsError } =
      await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('processed', false)
        .eq('document_id', doc.id);

    console.log('unprocessed leads found', unprocessedLeads?.length);

    if (unprocessedLeads?.length == 0) {
      updatedDocs.push(doc);

      await supabaseAdmin
        .from('documents')
        .update({ processed: true })
        .eq('id', doc.id);

      console.log(
        'sending an email (processed leads) to',
        doc.customer_to_email
      );

      const request = new SendEmailRequest({
        transactional_message_id: '2',
        message_data: {
          link: `https://www.knowmore.bot/view/${doc.id}`
        },
        identifiers: {
          id: doc.id
        },
        to: doc.customer_to_email,
        from: 'omar@knowmore.bot'
      });

      await customerio_client
        .sendEmail(request)
        .then((res: any) => console.log(res))
        .catch((err: any) => console.log(err.statusCode, err.message));
    }
  }
  return updatedDocs;
};

/**
 * This function is called when the leap workflow has finished processing the leads
 *
 * @param workflowResult - the output from the leap workflow
 */

const onProcessed = async (workflowResult: any) => {
  try {
    const { document_id: documentId, email_of_lead: leadEmail } =
      workflowResult.input;

    logger.info(
      `Leap returned linkedin ${leadEmail} for document ${documentId}`
    );

    await supabaseAdmin
      .from('leads')
      .update({ processed: true })
      .eq('document_id', documentId)
      .eq('email', leadEmail);

    if (!workflowResult.output) {
      logger.info(`No linkedin data found for: ${leadEmail}`);
      return;
    }

    const { linkedin } = workflowResult.output;

    if (linkedin) {
      const repairedJSON = jsonrepair(linkedin);
      console.log('repairedJSON:', repairedJSON);

      const parsedData = JSON.parse(repairedJSON);
      console.log('parsedData:', parsedData);

      const {
        person_full_name,
        person_linkedin_url,
        person_twitter_url,
        person_location,
        person_employment_title,
        person_estimated_salary,
        person_age,
        person_gender,
        person_bio,
        person_website,
        person_education_summary,
        company_name,
        company_website,
        company_industry,
        company_description,
        company_address,
        company_linkedin_url,
        company_twitter_url,
        company_num_employees,
        company_money_raised,
        company_metrics_annual_revenue,
        company_tech_stack,
        relevant_info
      } = parsedData;

      const company_tech_stack_string =
        company_tech_stack && company_tech_stack.join(', ');

      const updateData = {
        person_full_name,
        person_linkedin_url,
        person_twitter_url,
        person_location,
        person_employment_title,
        person_estimated_salary,
        person_age,
        person_gender,
        person_bio,
        person_website,
        person_education_summary,
        company_name,
        company_website,
        company_industry,
        company_description,
        company_address,
        company_linkedin_url,
        company_twitter_url,
        company_num_employees,
        company_money_raised,
        company_metrics_annual_revenue,
        company_tech_stack: company_tech_stack_string,
        relevant_info,
        processed: true
      };

      const { data, error } = await supabaseAdmin.from('profiles').upsert({
        email: leadEmail,
        ...updateData
      });

      console.log('updated profile data', data);

      if (error) {
        throw error;
      }

      const { data: leadData, error: leadError } = await supabaseAdmin
        .from('leads')
        .update({
          processed: true
        })
        .eq('email', leadEmail)
        .eq('document_id', documentId);

      if (leadError) {
        throw leadError;
      }
    }
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

// get document by id
const getDocument = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export {
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord,
  UploadCSV,
  upsertLeads,
  onUpload,
  onPaid,
  onProcessed,
  processEmails,
  checkProcessed,
  getDocument
};
