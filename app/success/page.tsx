import {
  getActiveProductsWithPrices,
  getSession,
  getSubscription
} from '@/app/supabase-server';
import Home from '@/components/Home';
import Success from '@/components/Success';
import { useState } from 'react';

export default async function SuccessPage() {
  return <Success />;
}
