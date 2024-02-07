import { checkProcessed } from '@/utils/supabase-admin';
import { NextResponse } from 'next/server'
 
export async function GET(request: Request) {
  checkProcessed();
  return NextResponse.json({}, { status: 200 });
}
