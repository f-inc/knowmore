import { getSession } from '@/app/supabase-server';
import { onUpload } from '@/utils/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const response = await req.json();
  const session = await getSession();
  const output = response;

  await onUpload(output.document_id, session?.user.email as string);
  
  return NextResponse.json({document_id: output.document_id}, { status: 200 });
}
