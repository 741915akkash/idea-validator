export const useExperiments = () => {
  const config = useRuntimeConfig()
  const enabled = config.public.experimentsEnabled
  const { $posthog } = useNuxtApp()

  const getVariant = (flag) => {
    if (process.server) return null
    const posthog = typeof $posthog === 'function' ? $posthog() : $posthog
    return posthog?.getFeatureFlag?.(flag) ?? null
  }

  return { enabled, getVariant }
}
