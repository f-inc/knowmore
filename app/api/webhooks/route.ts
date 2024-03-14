import { DocumentType } from '@/utils/constants/types'
import { stripe } from '@/utils/stripe'
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  onPaid
} from '@/utils/supabase-admin'
import Stripe from 'stripe'

import * as Sentry from '@sentry/nextjs'

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

export async function POST (req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) return
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    Sentry.captureException(err)
    console.log(`❌ Error message: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product)
          break
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price)
          break
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          )
          break
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            )
          }

          if (checkoutSession.mode === 'payment') {
            const metadata = checkoutSession?.metadata

            console.log('CHEKOUT', {
              docID: metadata?.document_id as string,
              email: checkoutSession?.customer_details?.email as string,
              docType: metadata?.document_type as DocumentType
            })

            await onPaid(
              metadata?.document_id as string,
              checkoutSession?.customer_details?.email as string,
              metadata?.document_type as DocumentType
            )
          }
          break
        default:
          throw new Error('Unhandled relevant event!')
      }
    } catch (error) {
      Sentry.captureException(error)
      console.log(error)
      return new Response(
        'Webhook handler failed. View your nextjs function logs.',
        {
          status: 400
        }
      )
    }
  }
  return new Response(JSON.stringify({ received: true }))
}
