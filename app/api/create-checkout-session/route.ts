import { Database } from '@/types_db'
import { getURL } from '@/utils/helpers'
import { stripe } from '@/utils/stripe'
import { createOrRetrieveCustomer } from '@/utils/supabase-admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'

export async function POST (req: Request) {
  if (req.method === 'POST') {
    const proto = req.headers.get('x-forwarded-proto')
    const host = req.headers.get('host')

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY

    const isTestMode = stripeSecretKey?.startsWith('sk_test_')

    // 1. Destructure the price and quantity from the POST body
    const { price, quantity = 1, metadata = {}, redirectURL } = await req.json()

    const docType = metadata.document_type

    try {
      // 2. Get the user from Supabase auth
      const supabase = createRouteHandlerClient<Database>({ cookies })
      const {
        data: { user }
      } = await supabase.auth.getUser()

      // 3. Retrieve or create the customer in Stripe
      const customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || ''
      })

      // 4. Create a checkout session in Stripe
      let session
      if (price.type === 'recurring') {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          billing_address_collection: 'required',
          customer,
          customer_update: {
            address: 'auto'
          },
          line_items: [
            {
              price: price.id,
              quantity
            }
          ],
          mode: 'subscription',
          allow_promotion_codes: true,
          subscription_data: {
            trial_from_plan: true,
            metadata
          },
          success_url: `${getURL()}${
            redirectURL ? `/${redirectURL}` : '/account'
          }`,
          cancel_url: `${proto}://${host}/dashboard${
            docType === 'domain' ? '/web3' : ''
          }`,
          metadata
        })
      } else if (price.type === 'one_time') {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          billing_address_collection: 'required',
          customer,
          customer_update: {
            address: 'auto'
          },
          line_items: [
            {
              price: price.id,
              quantity
            }
          ],
          mode: 'payment',
          allow_promotion_codes: true,

          success_url: `${getURL()}${
            redirectURL ? `/${redirectURL}` : '/account'
          }`,
          cancel_url: `${proto}://${host}/dashboard${
            docType === 'domain' ? '/web3' : ''
          }`,
          metadata
        })
      }

      if (session) {
        return new Response(JSON.stringify({ sessionId: session.id }), {
          status: 200
        })
      } else {
        return new Response(
          JSON.stringify({
            error: { statusCode: 500, message: 'Session is not defined' }
          }),
          { status: 500 }
        )
      }
    } catch (err: any) {
      console.log(err)
      return new Response(JSON.stringify(err), { status: 500 })
    }
  } else {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    })
  }
}
