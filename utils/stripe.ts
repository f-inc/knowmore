import { ensureEnvVar } from './helpers'
import Stripe from 'stripe'

const isTestMode = process.env.NEXT_PUBLIC_STRIPE_MODE === 'test'

const stripeSecretKey = isTestMode
  ? 'STRIPE_SECRET_KEY'
  : 'STRIPE_SECRET_KEY_LIVE'

ensureEnvVar(stripeSecretKey)

export const stripe = new Stripe(process.env[stripeSecretKey]!, {
  apiVersion: '2022-11-15',
  appInfo: {
    name: 'Next.js Subscription Starter',
    version: '0.1.0'
  }
})
