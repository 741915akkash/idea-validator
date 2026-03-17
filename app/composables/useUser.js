export function useUser() {
  const user = useState('user', () => null)
  return user
}

export async function bootstrapUser(options = {}) {
  const user = useUser()
  const isLoaded = useState('user:loaded', () => false)
  const pending = useState('user:pending', () => null)
  const force = Boolean(options?.force)

  if (isLoaded.value && !force) {
    return user
  }

  if (pending.value && !force) {
    await pending.value
    return user
  }

  const requestFetch = import.meta.server ? useRequestFetch() : $fetch

  pending.value = (async () => {
    try {
      const res = await requestFetch('/api/auth/me', { method: 'GET' })
      user.value = res?.user || null
    } catch {
      user.value = null
    } finally {
      isLoaded.value = true
      pending.value = null
    }
  })()

  await pending.value
  return user
}
