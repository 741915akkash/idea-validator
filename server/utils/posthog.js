import { PostHog } from 'posthog-node'

let client = null

export function useServerPostHog() {
  if (!client) {
    const config = useRuntimeConfig()
    const posthogConfig = config.public.posthog
    if (!posthogConfig?.enabled || !posthogConfig?.publicKey) {
      return null
    }
    client = new PostHog(posthogConfig.publicKey, { host: posthogConfig.host })
  }
  return client
}
