import { getRequestURL } from 'h3'
import { requireCrmEnabled } from '../utils/crmAccess'

export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname || ''

  if (!pathname.startsWith('/api/crm')) {
    return
  }

  requireCrmEnabled(event)
})
