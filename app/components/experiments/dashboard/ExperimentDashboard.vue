<script setup>
  import { Plus } from 'lucide-vue-next'
  import WinnersTable from './WinnersTable.vue'
  import ActiveExperimentsTable from './ActiveExperimentsTable.vue'
  import SuggestedExperiments from './SuggestedExperiments.vue'
  import ExperimentInsights from './ExperimentInsights.vue'

  const emit = defineEmits(['new', 'view-exp'])

  const winners = [
    { label: 'Best Audience', value: 'SaaS founders (0-5k)', exp: 'EXP-12' },
    { label: 'Best Message', value: 'Fear angle', exp: 'EXP-12' },
    { label: 'Best Channel', value: 'Reddit DM', exp: 'EXP-12' },
    { label: 'Best Offer', value: '$99 Starter Audit', exp: 'EXP-12' }
  ]

  const experiments = []

  const insights = [
    'Fear angle performs 2x better',
    'Reddit > LinkedIn in conversion',
    'Higher price ↑ revenue but ↓ conversion'
  ]

  const suggestions = [
    { title: 'Same audience + new message (Speed)', goal: 'test angle impact', type: 'Angle' },
    { title: 'Increase price ($49 → $79)', goal: 'maximize revenue', type: 'Price' },
    { title: 'Same message on LinkedIn', goal: 'test channel scaling', type: 'Channel' }
  ]
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-10 pb-20">
    <header class="mb-6 rounded-lg border border-slate-200 bg-white px-6 py-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- LEFT -->
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <span>📊 Experiment Dashboard</span>
          </h1>

          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>

          <p class="mt-3 text-sm text-slate-500">
            Aggregated feedback from your outreach operations.
          </p>
        </div>

        <!-- RIGHT -->
        <button
          @click="emit('new')"
          class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus class="h-4 w-4" />
          New Experiment
        </button>
      </div>
    </header>

    <!-- Winners Section -->
    <WinnersTable :winners="winners" />

    <!-- Experiments Table -->
    <ActiveExperimentsTable :experiments="experiments" @view="emit('view-exp', $event)" />

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <SuggestedExperiments :suggestions="suggestions" @run="emit('new')" />
      <ExperimentInsights :insights="insights" />
    </div>
  </div>
</template>
