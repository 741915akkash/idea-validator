export function useUsage() {
  const usage = useState('usage:data', () => null)
  const authenticated = useState('usage:authenticated', () => false)
  const loading = useState('usage:loading', () => false)
  const error = useState('usage:error', () => null)
  const lastFetchedAt = useState('usage:lastFetchedAt', () => 0)

  async function fetchUsage(force = false) {
    const now = Date.now()
    const CACHE_TTL_MS = 30 * 1000

    if (!force && now - Number(lastFetchedAt.value || 0) < CACHE_TTL_MS) {
      return usage.value
    }

    loading.value = true
    error.value = null

    try {
      const res = await $fetch('/api/usage', {
        method: 'GET',
        credentials: 'include'
      })

      authenticated.value = Boolean(res?.authenticated)
      usage.value = res?.usage || null
      lastFetchedAt.value = now
      return usage.value
    } catch (err) {
      error.value = err
      return usage.value
    } finally {
      loading.value = false
    }
  }

  function getFeature(key) {
    const data = usage.value?.[key]
    if (!data) return null

    const limit = data.limit
    const used = Number(data.used || 0)
    const percent =
      limit == null || Number(limit) <= 0 ? 0 : Math.min((used / Number(limit)) * 100, 100)

    return {
      ...data,
      percent
    }
  }

  return {
    usage,
    authenticated,
    loading,
    error,
    fetchUsage,
    getFeature
  }
}
