import { onDomainsProcessed } from '@/utils/supabase-admin'
import { NextResponse } from 'next/server'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  const response = await req.json()
  const output = response
  await onDomainsProcessed(output)
  return NextResponse.json({}, { status: 200 })
}
