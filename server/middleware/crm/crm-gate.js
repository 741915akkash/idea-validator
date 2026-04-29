import { getRequestURL } from 'h3'
import { requireCrmEnabled } from '../../utils/crm/crmAccess'

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname || ''

  if (!pathname.startsWith('/api/crm')) {
    return
  }

  await requireCrmEnabled(event)
})
