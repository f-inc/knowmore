import { onPaid } from '@/utils/supabase-admin';

export async function GET(req: Request) {
  // omar@f.inc eba5a0e1-97a7-4d6b-9c2d-45dcb9e4c365

  // huzaifa.a@berkeley.edu 64859882-6f3d-4e97-8d4f-1be28996f6c5

  // get the document_id and email from the query params

  const { searchParams } = new URL(req.url);
  const document_id = searchParams.get('document_id');
  const email = searchParams.get('email');

  if (document_id == null || email == null) {
    Response.json({ error: 'document_id and email are required' });
  }

  try {
    // await onPaid(document_id as string, email as string);
    Response.json({ message: 'Payment processed successfully' });
  } catch (error) {
    Response.json({ error: 'An error occurred while processing the payment' });
  }
}
