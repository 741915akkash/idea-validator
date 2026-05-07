<script setup>
import { computed, ref } from 'vue'
import ExperimentDashboard from '~/components/experiments/dashboard/ExperimentDashboard.vue'
import ExperimentDetail from '~/components/experiments/detail/ExperimentDetail.vue'
import ExperimentInput from '~/components/experiments/input/ExperimentInput.vue'
import { useExperiments } from '~/composables/useExperiments'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const { enabled } = useExperiments()

if (!enabled) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const activeTab = ref('dashboard')

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'detail', label: 'Detail' },
  { key: 'input', label: 'Input' }
]

const sampleExperiment = computed(() => ({
  id: 'EXP-12',
  title: 'Reddit - Fear - SaaS founders',
  results: { revenue: 8000, leads: 25, conversions: 5 },
  distribution: { platform: 'Reddit', volume: 50 },
  audience: { persona: 'SaaS Founders' }
}))

function onNewExperiment() {
  activeTab.value = 'input'
}

function onViewExperiment() {
  activeTab.value = 'detail'
}

function onBackToDashboard() {
  activeTab.value = 'dashboard'
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-2 py-4 sm:px-4">
    <header class="mb-6 flex items-center justify-between gap-4">
      <h1 class="text-xl font-semibold text-slate-900">Experiments</h1>
      <div class="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="
            activeTab === tab.key
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </header>

    <ExperimentDashboard
      v-if="activeTab === 'dashboard'"
      @new="onNewExperiment"
      @view-exp="onViewExperiment"
    />

    <ExperimentDetail
      v-else-if="activeTab === 'detail'"
      :experiment="sampleExperiment"
    />

    <ExperimentInput
      v-else
      @back="onBackToDashboard"
      @save="onBackToDashboard"
    />
  </section>
</template>
