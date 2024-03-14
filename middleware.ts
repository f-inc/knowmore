import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from '@/types_db'

export async function middleware (req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient<Database>({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  if (!session && (pathname === '/' || pathname === '/dashboard')) {
    const url = new URL(req.url)
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  return res
}
