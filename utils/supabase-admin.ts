import { toDateTime } from './helpers';
import { stripe } from './stripe';
import { Leap } from '@leap-ai/workflows';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database } from 'types_db';
import { v4 as uuid } from 'uuid';
const { APIClient, SendEmailRequest } = require("customerio-node");

const customerio_client = new APIClient(process.env.CUSTOMERIO_API_KEY as string);


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
  const { data: documents, error: documentsError } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', document_id);

  if (!documents || documents?.length == 0) { return }

  var doc = documents[0];

  if (!doc.slack_notified) {
    if (doc.total_leads >= Number(process.env.ZAPIER_SLACK_EMAIL_LIMIT || 5000)) {
      fetch(process.env.ZAPIER_SLACK_WEBHOOK as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "text": `${user_email || "Someone (not signed in)"} tried to upload a document with ${doc.total_leads} emails.\nDocumentID of the file they uploaded: ${document_id} \nYour current limit is set to: ${Number(process.env.ZAPIER_SLACK_EMAIL_LIMIT || 5000)}`,
          "channel": "#studio-knowmore"
        })
      });
    }
  }
}

const onPaid = async (document_id: string, customer_email: string) => {
  try {
    const { data: leadData, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id,email')
      .eq('document_id', document_id);

    if (!leadData) {
      throw leadError;
    }

    console.log("LEAP_WEBHOOK_URL", process.env.LEAP_WEBHOOK_URL)

    for (const lead in leadData) {
      const { id, email } = leadData[lead];

      const response = await leap.workflowRuns.workflow({
        workflow_id: process.env.LEAP_WORKFLOW_ID || 'wkf_Z2NKhgEKaL1UIL',
        webhook_url:
          process.env.LEAP_WEBHOOK_URL ||
          'http://localhost:3000/api/leap/webhook',
        input: {
          email_of_lead: email,
          user_website: `https://${email.split('@')[1]}`,
          document_id: document_id
        }
      });

      const { data: leadUpdateData, error: leadUpdateError } =
        await supabaseAdmin
          .from('leads')
          .update({
            processed: false,
            workflow_run_id: response.data.id
          })
          .eq('id', id);

      if (leadUpdateError) {
        throw leadUpdateError;
      }
      console.log('lead updated successfully:', leadUpdateData);
    }

    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('documents')
      .update({
        paid: true,
        processed: false,
        customer_to_email: customer_email
      })
      .eq('id', document_id);

    const request = new SendEmailRequest({
      transactional_message_id: "3",
      message_data: {
        lead_count: leadData.length,
      },
      identifiers: {
        id: document_id,
      },
      to: customer_email,
      from: "omar@knowmore.bot"
    });

    customerio_client.sendEmail(request)
      .then((res: any) => console.log(res))
      .catch((err: any) => console.log(err.statusCode, err.message))

    console.log('Document updated successfully:', documentData);

    if (documentError) {
      throw documentError;
    }
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

const checkProcessed = async (): Promise<any[]> => {

  const { data: unprocessedDocuments, error: unprocessedDocumentsError } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('processed', false);

  if (unprocessedDocumentsError) {
    throw unprocessedDocumentsError;
  }

  const updatedDocs: any[] = [];

  for (const doc of unprocessedDocuments) {
    const { data: unprocessedLeads, error: unprocessedLeadsError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('processed', false)
      .eq('document_id', doc.id);

    // all leads have been processed
    if (unprocessedLeads?.length == 0) {
      updatedDocs.push(doc);

      await supabaseAdmin
        .from('documents')
        .update({ processed: true })
        .eq('id', doc.id);

      const request = new SendEmailRequest({
        transactional_message_id: "2",
        message_data: {
          link: `https://www.knowmore.bot/view/${doc.id}`,
        },
        identifiers: {
          id: doc.id,
        },
        to: doc.customer_to_email,
        from: "omar@knowmore.bot"
      });

      customerio_client.sendEmail(request)
        .then((res: any) => console.log(res))
        .catch((err: any) => console.log(err.statusCode, err.message))
    }
  }
  return updatedDocs;
}

const onProcessed = async (
  output: any
) => {
  try {

    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('leads')
      .update({ processed: true })
      .eq('workflow_run_id', output.id);

    console.log(output.output.output as string);

    const lead = JSON.parse((output.output.output as string).replaceAll("\n", "").replaceAll("\t", "").replaceAll("'", "\""));

    if (!lead.email) {
      return;
    }
    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({
        email: lead.email,
        name: lead.name || lead.full_name,
        linkedin: lead.linkedin || lead.linkedIn || lead.linkedin_url,
        company: lead.company || lead.companyName || lead.job_history[0].company,
        role: lead.role || lead.current_job_position,
        location: lead.location
      })
      .eq('document_id', output.input.document_id)
      .eq('email', lead.email);
    if (error) {
      throw error;
    }

    if (documentError) {
      throw documentError; // Throw an error if there was an issue updating the document
    }

    console.log('Document updated successfully:', documentData);
  } catch (error) {
    console.error('Error updating document:', error);
  }
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
  checkProcessed
};
