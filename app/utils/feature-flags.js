export function isCrmEnabled(user, config) {
  if (config.public.isDev) return true
  return !!user?.crm_enabled
}
