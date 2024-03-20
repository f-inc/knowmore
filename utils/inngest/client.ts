import Logger from '@/logger'
import { Inngest } from 'inngest'

const logger = new Logger({ name: 'inngest-functions' })

export const inngest = new Inngest({ id: 'my-app', logger })
