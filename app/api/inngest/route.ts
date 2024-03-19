import { inngest } from '@/utils/inngest/client'
import { processDocument, processDomain } from '@/utils/inngest/functions'
import { serve } from 'inngest/next'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processDocument, processDomain]
})
