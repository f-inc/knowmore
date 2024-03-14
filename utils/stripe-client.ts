import { postData } from './helpers'
import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        ''
    )
  }

  return stripePromise
}

export const createOneTimeCheckoutSession = async ({
  priceId,
  quantity,
  metadata
}: {
  priceId: string
  quantity: number
  metadata: { document_id: string; document_type: string }
}): Promise<{ sessionId: string }> => {
  try {
    const { sessionId } = await postData({
      url: '/api/create-checkout-session',
      data: {
        price: {
          id: priceId,
          type: 'one_time'
        },
        metadata,
        redirectURL: `success?document_id=${metadata.document_id}`,
        quantity: quantity
      }
    })
    return { sessionId }
  } catch (error) {
    console.error('Error creating checkout session', error)
    throw error
  }
}
