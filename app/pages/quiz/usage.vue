<script setup>
  import { computed, onMounted } from 'vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const { usage, authenticated, loading, error, fetchUsage, getFeature } = useUsage()

  const featureConfig = [
    { key: 'freeformInterviewsPerIdeaPerMonth', label: 'Freeform Interviews' },
    { key: 'activeIdeas', label: 'Active Ideas' },
    { key: 'archivedIdeas', label: 'Archived Ideas' },
    { key: 'revisionsPerIdea', label: 'Revisions Per Idea' },
    { key: 'structuredValidation', label: 'Structured Validation' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'pipelines', label: 'Pipelines' }
  ]

  const rows = computed(() =>
    featureConfig
      .map((feature) => ({
        ...feature,
        data: getFeature(feature.key)
      }))
      .filter((feature) => !!feature.data)
  )

  const hasRows = computed(() => rows.value.length > 0)

  function formatResetDate(value) {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function formatLimit(limit) {
    return limit == null ? '0' : String(limit)
  }

  function formatEnabled(enabled) {
    return enabled ? 'Enabled' : 'Disabled'
  }

  onMounted(async () => {
    await fetchUsage()
  })
</script>

<template>
  <main class="px-6 py-6">
    <div class="mx-auto max-w-4xl">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-app-text">Usage</h1>
        <button
          class="rounded-md border border-app-border px-4 py-2 text-sm font-medium text-app-text hover:bg-app-hover disabled:opacity-60"
          :disabled="loading"
          @click="fetchUsage(true)"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div
        v-if="!authenticated"
        class="rounded-lg border border-app-border bg-app-panel px-4 py-3 text-sm text-app-text"
      >
        Sign in to view usage.
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        Unable to load usage right now.
      </div>

      <div
        v-else-if="loading && !hasRows"
        class="rounded-lg border border-app-border bg-app-panel px-4 py-3 text-sm text-app-text"
      >
        Loading usage...
      </div>

      <div
        v-else-if="!hasRows"
        class="rounded-lg border border-app-border bg-app-panel px-4 py-3 text-sm text-app-text"
      >
        No usage data available yet.
      </div>

      <div v-else class="space-y-3">
        <section
          v-for="feature in rows"
          :key="feature.key"
          class="rounded-lg border border-app-border bg-app-panel p-4 text-app-text"
        >
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-app-text">{{ feature.label }}</h2>
            <span class="text-xs text-app-muted">Tier: {{ feature.data.tier }}</span>
          </div>

          <div v-if="feature.data.period !== 'none'" class="mb-2 text-sm text-app-text">
            <span class="font-medium">{{ feature.data.used }}</span>
            <span class="text-app-muted"> / {{ formatLimit(feature.data.limit) }}</span>
            <span v-if="feature.data.limit !== null" class="ml-2 text-xs text-app-muted">
              ({{ feature.data.remaining }} remaining)
            </span>
          </div>

          <div v-else class="mb-2 flex items-center justify-between gap-3 text-sm text-app-text">
            <div>
              <span class="font-medium">Status:</span>
              <span :class="feature.data.enabled ? 'text-emerald-500' : 'text-rose-700'">
                {{ formatEnabled(feature.data.enabled) }}
              </span>
            </div>
            <NuxtLink
              v-if="!feature.data.enabled"
              to="/general/pricing"
              class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Upgrade
            </NuxtLink>
          </div>

          <div
            v-if="feature.data.limit !== null"
            class="h-2 w-full overflow-hidden rounded-full bg-app-hover"
          >
            <div
              class="h-full rounded-full bg-emerald-600 transition-all"
              :style="{ width: `${feature.data.percent}%` }"
            />
          </div>

          <div class="mt-2 text-xs text-app-muted">
            <template v-if="feature.data.resets_at">
              Period: {{ feature.data.period }} · Resets:
              {{ formatResetDate(feature.data.resets_at) }}
            </template>
            <template v-else>Period: {{ feature.data.period }}</template>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
