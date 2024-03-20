import { getOgTitle, getURL } from '../helpers'
import { supabaseAdmin } from '../supabase-admin'
import { inngest } from './client'
import Logger from '@/logger'
import { Leap } from '@leap-ai/workflows'

const leap = new Leap({
  apiKey: process.env.LEAP_API_KEY as string
})

export const processDomainDocument = inngest.createFunction(
  { id: 'process-domain-document' },
  { event: 'app/process-domain-document-triggered' },
  async ({ event, step, logger }) => {
    const { documentId } = event.data

    logger.debug('Processing domain document', documentId)

    const { data: domains, error: domainsError } = await supabaseAdmin
      .from('domains')
      .select('*')
      .eq('document_id', documentId)

    if (domainsError) {
      throw domainsError
    }

    if (!domains) {
      return
    }

    const events = domains.map((domain) => ({
      id: `${domain.document_id}-${domain.domain}`,
      name: 'app/process-domain',
      data: { documentId: domain.document_id, domain: domain.domain }
    }))

    logger.debug('Sending events to inngest', events.length)
    const { ids } = await inngest.send(events)

    logger.debug('Sent inngest events with ids', ids)
  }
)

export const processDomain = inngest.createFunction(
  { id: 'process-domain' },
  { event: 'app/process-domain' },
  async ({ event, step, logger }) => {
    // const workflow_id = 'wkf_sTdAAKT4tD2NLQ' // playground
    const workflow_id = 'wkf_H2EahyOnNQ37xb' // playground 2

    const { domain, documentId } = event.data

    logger.info('Processing domain', domain, documentId)

    const websiteTitle = await getOgTitle(domain)

    const LEAP_WEBHOOK_URL = process.env.LEAP_WEBHOOK_URL

    const webhook_url = `${
      LEAP_WEBHOOK_URL ?? getURL()
    }/api/leap/domains/webhook`

    logger.debug('Sending request to leap', domain, documentId)
    await leap.workflowRuns.workflow({
      workflow_id,
      webhook_url: webhook_url,

      input: {
        domain,
        websitetitle: websiteTitle,
        document_id: documentId
      }
    })
  }
)
