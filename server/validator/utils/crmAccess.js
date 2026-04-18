import { createError } from 'h3'

export function requireCrmEnabled(event) {
  const user = event.context?.user || null

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Login required'
    })
  }

  if (!user.crm_enabled) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CRM access is not enabled for this account'
    })
  }

  return { userId: user.id }
}
