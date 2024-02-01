import * as fbq from '@/lib/fb-pixel';
import * as gtag from '@/lib/gtag';
import type { Database } from '@/types_db';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  fbq.event('signup');
  gtag.event({ action: 'signup' });

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
