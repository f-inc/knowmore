import {
  onProcessed,
  processDomains,
  processEmails
} from '@/utils/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { document_id, leads } = await req.json();

  processDomains(document_id, leads);

  return NextResponse.json({}, { status: 200 });
}
