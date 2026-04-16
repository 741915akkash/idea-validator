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
    { key: 'structuredValidation', label: 'Structured Validation' }
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
    return limit == null ? 'Unlimited' : String(limit)
  }

  onMounted(async () => {
    await fetchUsage()
  })
</script>

<template>
  <main class="px-6 py-6">
    <div class="mx-auto max-w-4xl">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-slate-900">Usage</h1>
        <button
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          :disabled="loading"
          @click="fetchUsage(true)"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div v-if="!authenticated" class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        Sign in to view usage.
      </div>

      <div v-else-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Unable to load usage right now.
      </div>

      <div
        v-else-if="loading && !hasRows"
        class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
      >
        Loading usage...
      </div>

      <div v-else-if="!hasRows" class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        No usage data available yet.
      </div>

      <div v-else class="space-y-3">
        <section
          v-for="feature in rows"
          :key="feature.key"
          class="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-900">{{ feature.label }}</h2>
            <span class="text-xs text-slate-500">Tier: {{ feature.data.tier }}</span>
          </div>

          <div class="mb-2 text-sm text-slate-700">
            <span class="font-medium">{{ feature.data.used }}</span>
            <span class="text-slate-500"> / {{ formatLimit(feature.data.limit) }}</span>
            <span v-if="feature.data.limit !== null" class="ml-2 text-xs text-slate-500">
              ({{ feature.data.remaining }} remaining)
            </span>
          </div>

          <div
            v-if="feature.data.limit !== null"
            class="h-2 w-full overflow-hidden rounded-full bg-slate-200"
          >
            <div
              class="h-full rounded-full bg-emerald-600 transition-all"
              :style="{ width: `${feature.data.percent}%` }"
            />
          </div>

          <div class="mt-2 text-xs text-slate-500">
            Period: {{ feature.data.period }} · Resets: {{ formatResetDate(feature.data.resets_at) }}
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
