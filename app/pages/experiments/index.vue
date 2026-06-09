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
    <div class="mb-6 rounded-lg border border-app-border bg-app-panel px-6 py-5">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-app-text">Experiments</h1>

          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
        </div>
        <div class="inline-flex rounded-lg border border-app-border bg-app-panel p-1 text-app-text">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            :class="
              activeTab === tab.key
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'text-app-muted hover:bg-app-hover hover:text-app-text'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </header>
    </div>

    <ExperimentDashboard
      v-if="activeTab === 'dashboard'"
      @new="onNewExperiment"
      @view-exp="onViewExperiment"
    />

    <ExperimentDetail v-else-if="activeTab === 'detail'" :experiment="sampleExperiment" />

    <ExperimentInput v-else @back="onBackToDashboard" @save="onBackToDashboard" />
  </section>
</template>
