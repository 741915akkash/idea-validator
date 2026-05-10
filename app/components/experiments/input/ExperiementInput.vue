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
  message: { pain: 'High churn', angle: 'Fear', hook: 'Your users are leaving in the first 48 hours.' },
  offer: { type: 'Service', price: 1999, value: 'Churn audit & Fix' },
  distribution: { platform: 'Reddit', format: 'Direct Message' },
  volume: { actions_taken: 50 },
  results: { leads: 0, conversions: 0, revenue: 0, cost: 0, notes: '' },
  variable: 'Message'
})

const activeAccordion = ref('audience')

const save = () => {
  emit('save', { ...form.value, id: `EXP-${Math.floor(Math.random() * 1000)}`, date: new Date().toISOString() })
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-20 px-4 md:px-8">
    <div class="flex items-center justify-between mb-8">
      <button @click="$emit('back')" class="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft class="h-4 w-4" />
        <span class="text-sm font-medium uppercase tracking-wider">Back to Dashboard</span>
      </button>
      <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
        <Copy class="h-4 w-4" />
        DUPLICATE LAST
      </button>
    </div>

    <header class="mb-12">
      <h1 class="text-4xl font-extrabold tracking-tight text-slate-900">🧪 Create Experiment</h1>
      <p class="text-slate-500 mt-2 text-lg font-medium">Configure your variables and strategy.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
      <!-- Left Column: Accordions -->
      <div class="lg:col-span-3 space-y-4">
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
