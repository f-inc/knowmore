import { checkProcessed } from '@/utils/supabase-admin';

export async function GET() {
  checkProcessed();
}

