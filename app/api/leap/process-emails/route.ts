import { onProcessed, processEmails } from '@/utils/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { document_id, leads } = await req.json();

  // you are given a list of emails in the response object
  // process the emails

  processEmails(document_id, leads);

  return NextResponse.json({}, { status: 200 });
}
