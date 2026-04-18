export function useCredits() {
  const credits = useState('credits:data', () => null)
  const authenticated = useState('credits:authenticated', () => false)
  const loading = useState('credits:loading', () => false)
  const error = useState('credits:error', () => null)
  const lastFetchedAt = useState('credits:lastFetchedAt', () => 0)

  async function fetchCredits(force = false) {
    const now = Date.now()
    const CACHE_TTL_MS = 20 * 1000

    if (!force && now - Number(lastFetchedAt.value || 0) < CACHE_TTL_MS) {
      return credits.value
    }

    loading.value = true
    error.value = null

    try {
      const res = await $fetch('/api/credits', {
        method: 'GET',
        credentials: 'include'
      })

      authenticated.value = Boolean(res?.authenticated)

      credits.value = res?.authenticated
        ? {
            balance: Number(res?.balance || 0),
            monthly_allocation: Number(res?.monthly_allocation || 0),
            used: Number(res?.used || 0),
            resets_at: res?.resets_at || null
          }
        : null

      lastFetchedAt.value = now
      return credits.value
    } catch (err) {
      error.value = err
      return credits.value
    } finally {
      loading.value = false
    }
  }

  return {
    credits,
    authenticated,
    loading,
    error,
    fetchCredits
  }
}
