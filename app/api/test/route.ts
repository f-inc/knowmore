import { getSession } from '@/app/supabase-server';
import { onPaid, onUpload } from '@/utils/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  await onPaid(
    '82e46f54-8cf4-41c4-9bb2-9e20ad15c149',
    'ahmadhuzaifa012@gmail.com'
  );
}
