<script setup>
  import { ref } from 'vue'
  import { ArrowLeft, Copy } from 'lucide-vue-next'
  import AudienceForm from './AudienceForm.vue'
  import MessageForm from './MessageForm.vue'
  import OfferForm from './OfferForm.vue'
  import DistributionForm from './DistributionForm.vue'
  import VolumeForm from './VolumeForm.vue'
  import ExperimentSummary from './ExperimentSummary.vue'

  const emit = defineEmits(['back', 'save'])

  const form = ref({
    audience: {
      persona: 'SaaS Founders',
      stage: 'beginner',
      industry: 'Tech',
      geography: '',
      notes: '',
      tags: ''
    },
    message: {
      pain: 'High churn',
      angle: 'Fear',
      hook: 'Your users are leaving in the first 48 hours.'
    },
    offer: { type: 'Service', price: 99, value: 'Churn audit starter pack' },
    distribution: { platform: 'Reddit', format: 'Direct Message' },
    volume: { actions_taken: 50 },
    results: { leads: 0, conversions: 0, revenue: 0, cost: 0, notes: '' },
    variable: 'Message'
  })

  const activeAccordion = ref('audience')

  const save = () => {
    emit('save', {
      ...form.value,
      id: `EXP-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString()
    })
  }
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 pb-20">
    <div class="mb-8 flex items-center justify-between">
      <button
        @click="$emit('back')"
        class="flex items-center gap-2 text-app-muted transition-colors hover:text-app-text"
      >
        <ArrowLeft class="h-4 w-4" />
        <span class="text-sm font-medium uppercase tracking-wider">Back to Dashboard</span>
      </button>
      <button
        class="flex items-center gap-2 rounded-xl border border-app-border bg-app-panel px-4 py-2 text-xs font-bold text-app-muted transition-colors hover:bg-app-hover hover:text-app-text"
      >
        <Copy class="h-4 w-4" />
        DUPLICATE LAST
      </button>
    </div>

    <header
  class="mb-6 rounded-lg border border-app-border bg-app-panel px-6 py-5 text-app-text"
>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- LEFT -->
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-app-text">
            <span>Create Experiment</span>
          </h1>

          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>

          <p class="mt-3 text-sm text-app-muted">Configure your variables and strategy.</p>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-5">
      <!-- Left Column: Accordions -->
      <div class="space-y-4 lg:col-span-3">
        <AudienceForm
          v-model="form.audience"
          :active="activeAccordion === 'audience'"
          @toggle="activeAccordion = 'audience'"
        />

        <MessageForm
          v-model="form.message"
          :active="activeAccordion === 'message'"
          @toggle="activeAccordion = 'message'"
        />

        <OfferForm
          v-model="form.offer"
          :active="activeAccordion === 'offer'"
          @toggle="activeAccordion = 'offer'"
        />

        <DistributionForm
          v-model="form.distribution"
          v-model:variable="form.variable"
          :active="activeAccordion === 'dist'"
          @toggle="activeAccordion = 'dist'"
        />

        <VolumeForm
          v-model="form.volume"
          :active="activeAccordion === 'volume'"
          @toggle="activeAccordion = 'volume'"
        />
      </div>

      <!-- Right Column: Summary Table -->
      <ExperimentSummary :form="form" @save="save" />
    </div>
  </div>
</template>
