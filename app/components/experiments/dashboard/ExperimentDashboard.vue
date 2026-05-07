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
  { label: 'Best Offer', value: '₹1999 Audit', exp: 'EXP-12' },
]

const experiments = [
  { id: 'E12', audience: 'SaaS', msg: 'Fear', offer: '1999', channel: 'RD', revenue: '8k', cr: '12%', status: 'winning' },
  { id: 'E11', audience: 'SaaS', msg: 'Speed', offer: '999', channel: 'LI', revenue: '3k', cr: '5%', status: 'neutral' },
  { id: 'E10', audience: 'Marketers', msg: 'Logic', offer: '4999', channel: 'EM', revenue: '0', cr: '0%', status: 'failing' },
]

const insights = [
  'Fear angle performs 2x better',
  'Reddit > LinkedIn in conversion',
  'Higher price ↑ revenue but ↓ conversion',
]

const suggestions = [
  { title: 'Same audience + new message (Speed)', goal: 'test angle impact', type: 'Angle' },
  { title: 'Increase price (₹1999 → ₹2999)', goal: 'maximize revenue', type: 'Price' },
  { title: 'Same message on LinkedIn', goal: 'test channel scaling', type: 'Channel' },
]
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-10 pb-20">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          📊 Experiment Dashboard
        </h1>
        <p class="text-slate-500 mt-1">Aggregated feedback from your outreach operations.</p>
      </div>
      <button @click="emit('new')" class="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
        <Plus class="h-5 w-5" />
        New Experiment
      </button>
    </header>

    <!-- Winners Section -->
    <WinnersTable :winners="winners" />

    <!-- Experiments Table -->
    <ActiveExperimentsTable :experiments="experiments" @view="emit('view-exp', $event)" />

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <SuggestedExperiments :suggestions="suggestions" @run="emit('new')" />
      <ExperimentInsights :insights="insights" />
    </div>
  </div>
</template>
