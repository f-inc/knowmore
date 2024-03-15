import { ensureEnvVar } from './helpers'
import Stripe from 'stripe'

ensureEnvVar('STRIPE_SECRET_KEY')

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
  appInfo: {
    name: 'Next.js Subscription Starter',
    version: '0.1.0'
  }
})
