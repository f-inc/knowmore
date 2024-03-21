import { getSession } from '@/app/supabase-server';
import Document from '@/components/Document';
import { stripe } from '@/utils/stripe';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default async function DocumentPage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  const session = await getSession();

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;

  const price = await stripe.prices.retrieve(priceId);

  return (
    <Document
      id={id}
      user={session?.user}
      lead_limit={Number(process.env.ZAPIER_SLACK_EMAIL_LIMIT || 5000)}
      price={price.unit_amount! / 100}
    />
  );
}
