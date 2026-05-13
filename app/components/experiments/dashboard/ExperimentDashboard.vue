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
    <header class="flex items-center justify-between">
      <div>
        <h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
          📊 Experiment Dashboard
        </h1>
        <p class="mt-1 text-slate-500">Aggregated feedback from your outreach operations.</p>
      </div>
      <button
        @click="emit('new')"
        class="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus class="h-5 w-5" />
        New Experiment
      </button>
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
