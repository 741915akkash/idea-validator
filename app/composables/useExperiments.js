export const useExperiments = () => {
  const config = useRuntimeConfig()
  const enabled = config.public.experimentsEnabled && config.public.isDev
  const { $posthog } = useNuxtApp()

  const getVariant = (flag) => {
    if (process.server) return null
    const posthog = typeof $posthog === 'function' ? $posthog() : $posthog
    return posthog?.getFeatureFlag?.(flag) ?? null
  }

  return { enabled, getVariant }
}
