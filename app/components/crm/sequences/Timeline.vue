<script setup>
import { Phone, Mail, MessageSquare } from 'lucide-vue-next';

defineProps({
  steps: Array,
  cumulativeDays: Array
});

defineEmits(['scrollToStep']);
</script>

<template>
  <div v-if="steps.length > 0" class="bg-white border border-gray-100 rounded-[32px] p-5 flex items-center justify-between shadow-sm transition-all">
    <div class="flex items-center gap-5 overflow-x-auto no-scrollbar flex-1">
      <div class="shrink-0 text-[9px] font-black text-gray-300 uppercase tracking-widest mr-2">Workflow<br/>Timeline</div>

      <div class="flex items-center">
        <template v-for="(step, i) in steps" :key="'summary-'+i">
          <button
            @click="$emit('scrollToStep', i)"
            class="group relative flex items-center gap-2.5 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-100 hover:border-emerald-200 rounded-[20px] transition-all shrink-0 shadow-sm"
            :style="{ opacity: Math.max(0.6, 1 - (i * 0.08)) }"
          >
            <div :class="[
              'p-1.5 rounded-lg transition-colors',
              step.type === 'call' ? 'bg-blue-50 text-blue-500' :
              step.type === 'email' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'
            ]">
              <component
                :is="step.type === 'call' ? Phone : step.type === 'email' ? Mail : MessageSquare"
                class="w-3.5 h-3.5"
              />
            </div>
            <div class="flex flex-col items-start leading-tight">
              <span class="text-xs font-black text-gray-900 whitespace-nowrap">{{ step.title || (step.type + ' ' + (i+1)) }}</span>
              <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Day {{ cumulativeDays[i] }}</span>
            </div>
          </button>

          <div v-if="i < steps.length - 1" class="w-8 h-0.5 bg-gray-100 shrink-0 mx-2 rounded-full"></div>
        </template>
      </div>
    </div>
  </div>
</template>
