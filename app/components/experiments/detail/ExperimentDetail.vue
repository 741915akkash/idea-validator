<script setup>
  import { BarChart3, Edit3, Layers, RefreshCw } from 'lucide-vue-next'
  import PerformanceGrid from './PerformanceGrid.vue'
  import LeadsTable from './LeadsTable.vue'
  import TechnicalBreakdown from './TechnicalBreakdown.vue'
  import ActionRecommendations from './ActionRecommendations.vue'

  const emit = defineEmits(['view-crm'])

  const props = defineProps({
    experiment: {
      type: Object,
      required: true,
      default: () => ({
        id: 'EXP-12',
        title: 'Reddit – Fear – SaaS founders',
        results: { revenue: 8000, leads: 25, conversions: 5 },
        distribution: { platform: 'Reddit', volume: 50 },
        audience: { persona: 'SaaS Founders' }
      })
    },
    leads: {
      type: Array,
      default: () => [
        { id: 1, name: 'Akash Gupta', stage: 'Closed', value: 3000, source: 'Reddit' },
        { id: 2, name: 'Rahul Sharma', stage: 'Interested', value: 0, source: 'Reddit' }
      ]
    }
  })
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-8 pb-20">
    <header class="mb-6 rounded-lg border border-app-border bg-app-panel px-6 py-5 text-app-text">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- LEFT -->
        <div class="flex items-start gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"
          >
            <BarChart3 class="h-6 w-6" />
          </div>

          <div>
            <h1 class="text-2xl font-semibold tracking-tight text-app-text">
              {{ props.experiment.title }}
            </h1>

            <div class="mt-2 h-1 w-16 bg-emerald-500"></div>

            <p class="mt-3 text-sm text-app-muted">
              Experiment ID: {{ props.experiment.id }} • Created 2 days ago
            </p>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-app-border bg-app-panel px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-hover"
          >
            <Edit3 class="h-4 w-4" />
            Edit
          </button>

          <button
            class="inline-flex items-center gap-2 rounded-lg border border-app-border bg-app-panel px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-hover"
          >
            <Layers class="h-4 w-4" />
            Compare
          </button>

          <button
            class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <RefreshCw class="h-4 w-4" />
            Duplicate Experiment
          </button>
        </div>
      </div>
    </header>

    <!-- Stats Performance Grid -->
    <PerformanceGrid :results="props.experiment.results" />

    <!-- Leads Section -->
    <LeadsTable :leads="props.leads" @view-crm="emit('view-crm')" />

    <!-- Breakdown Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <TechnicalBreakdown
        :distribution="props.experiment.distribution"
        :results="props.experiment.results"
      />
      <ActionRecommendations />
    </div>
  </div>
</template>
