import { getSession } from '@/app/supabase-server';
import { onUpload } from '@/utils/supabase-admin';

export async function POST(req: Request) {
  const response = await req.json();
  const session = await getSession();

  const output = response;

  console.log(output.document_id, session?.user.email as string);

  onUpload(output.document_id, session?.user.email as string);
}
