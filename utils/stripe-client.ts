import { postData } from './helpers';
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        ''
    );
  }

  return stripePromise;
};

export const createOneTimeCheckoutSession = async ({
  priceId,
  document_id
}: {
  priceId: string;
  document_id: string;
  product_id: string;
}): Promise<{ sessionId: string }> => {
  const { sessionId } = await postData({
    url: '/api/create-checkout-session',
    data: {
      price: {
        id: priceId,
        type: 'one_time'
      },
      metadata: {
        document_id
      },
      redirectURL: window.location.pathname,
      quantity: 1
    }
  });
  return { sessionId };
};
