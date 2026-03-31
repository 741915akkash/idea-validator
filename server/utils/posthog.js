import { PostHog } from 'posthog-node'

let client = null

export function useServerPostHog() {
  if (!client) {
    const config = useRuntimeConfig()
    const posthogConfig = config.public.posthog
    client = new PostHog(posthogConfig.publicKey, { host: posthogConfig.host })
  }
  return client
}
