import {
  getActiveProductsWithPrices,
  getSession,
  getSubscription
} from '@/app/supabase-server';
import Dashboard from '@/components/Dashboard';
import Home from '@/components/Home';
import { useState } from 'react';

export default async function PricingPage() {
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription()
  ]);

  return <Home user={session?.user} />;
}
