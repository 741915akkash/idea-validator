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
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="bg-nuxt-green/10 text-nuxt-green flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <BarChart3 class="h-6 w-6" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ props.experiment.title }}</h1>
          <p class="text-sm text-slate-500">
            Experiment ID: {{ props.experiment.id }} • Created 2 days ago
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          <Edit3 class="h-4 w-4" /> Edit
        </button>
        <button
          class="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          <Layers class="h-4 w-4" /> Compare
        </button>
        <button
          class="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform hover:bg-slate-800 active:scale-95"
        >
          <RefreshCw class="h-4 w-4" /> Duplicate Experiment
        </button>
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
