import { toDateTime } from './helpers';
import { stripe } from './stripe';
import { Leap } from '@leap-ai/workflows';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database } from 'types_db';
import { v4 as uuid } from 'uuid';

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

const onPaid = async (document_id: string) => {
  try {
    const { data: leadData, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('email')
      .eq('document_id', document_id);

    if (!leadData) {
      throw leadError;
    }

    // call leap API here
    const response = await leap.workflowRuns.workflow({
      workflow_id: 'wkf_LhHiATZN4uI11H',
      webhook_url: process.env.LEAP_WEBHOOK,
      input: {
        csv: JSON.stringify(Object.values(leadData)),
        document_id: document_id
      }
    });

    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('documents')
      .update({
        paid: true,
        processed_rows: 0,
        workflow_run_id: response.data.id
      })
      .eq('id', document_id);

    if (documentError) {
      throw documentError; // Throw an error if there was an issue updating the document
    }

    console.log('Document updated successfully:', documentData);
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

const onProcessed = async (
  workflow_run_id: string,
  document_id: string,
  processedData: []
) => {
  try {
    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('documents')
      .update({ paid: true, processed_rows: 1 })
      .eq('workflow_run_id', workflow_run_id);

    processedData.forEach(async (lead: any) => {
      console.log(lead);
      if (!lead.email) {
        return;
      }
      const { data, error } = await supabaseAdmin
        .from('leads')
        .update({
          email: lead.email,
          name: lead.name,
          linkedin: lead.linkedin
            ? lead.linkedin
            : lead.linkedIn
            ? lead.linkedIn
            : '',
          company: lead.company
            ? lead.company
            : lead.companyName
            ? lead.companyName
            : '',
          role: lead.role,
          location: lead.location,
          salary: lead.salary,
          website: lead.website
        })
        .eq('document_id', document_id)
        .eq('email', lead.email);
      if (error) {
        throw error;
      }
    });

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
  onPaid,
  onProcessed
};
