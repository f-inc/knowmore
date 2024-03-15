import {
  onProcessed,
  processDomains,
  processEmails
} from '@/utils/supabase-admin'
import { NextResponse } from 'next/server'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  const { document_id, domains } = await req.json()

  await processDomains(document_id, domains)

  return NextResponse.json({}, { status: 200 })
}
