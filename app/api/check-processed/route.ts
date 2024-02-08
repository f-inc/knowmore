import { checkProcessed } from '@/utils/supabase-admin';
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
 
export async function GET(request: Request) {
  const updatedDocs = await checkProcessed();
  return NextResponse.json({updatedDocs:updatedDocs}, { status: 200 });
}
