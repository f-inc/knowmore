import {
  getActiveProductsWithPrices,
  getSession,
  getSubscription
} from '@/app/supabase-server';
import Home from '@/components/Home';
import { useState } from 'react';

export default async function PricingPage() {
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription()
  ]);

  return <Home user={session?.user} />;
  // return <Pricing session={session} user={session?.user} products={products} subscription={subscription} />
}
