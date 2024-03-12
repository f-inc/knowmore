import {
  getActiveProductsWithPrices,
  getSession,
  getSubscription
} from '@/app/supabase-server';
import Dashboard from '@/components/Dashboard';
import Web3Dashboard from '@/components/Web3Dashboard';

export default async function Web3Page() {
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription()
  ]);

  return <Dashboard user={session?.user} web3 />;
}
