import Pricing from '@/components/Pricing';
import {
  getSession,
  getSubscription,
  getActiveProductsWithPrices
} from '@/app/supabase-server';
import CsvDownload from '@/components/CsvDownload';

export default async function PricingPage() {
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription()
  ]);

  return (
    // <Pricing
    //   session={session}
    //   user={session?.user}
    //   products={products}
    //   subscription={subscription}
    // />
    <CsvDownload />
  );
}
