export const useExperiments = () => {
  const { $posthog } = useNuxtApp()

  const getVariant = (flag) => {
    if (process.server) return null
    return $posthog.getFeatureFlag(flag)
  }

  return { getVariant }
}
