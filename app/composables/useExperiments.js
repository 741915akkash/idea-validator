export const useExperiments = () => {
  const { $posthog } = useNuxtApp()

  const getVariant = (flag) => {
    if (process.server) return null
    const posthog = typeof $posthog === 'function' ? $posthog() : $posthog
    return posthog?.getFeatureFlag?.(flag) ?? null
  }

  return { getVariant }
}
