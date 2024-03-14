import { getSession } from '@/app/supabase-server';
import Document from '@/components/Document';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default async function DocumentPage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  const session = await getSession();

  return (
    <Document
      id={id}
      user={session?.user}
      lead_limit={Number(process.env.ZAPIER_SLACK_EMAIL_LIMIT || 5000)}
    />
  );
}
