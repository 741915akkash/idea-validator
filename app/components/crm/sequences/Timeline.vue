<script setup>
  import { Phone, Mail, MessageSquare } from 'lucide-vue-next'

  defineProps({
    steps: Array,
    cumulativeDays: Array
  })

  defineEmits(['scrollToStep'])
</script>

<template>
  <div
    v-if="steps.length > 0"
    class="flex items-center justify-between rounded-[32px] border border-app-border p-5 text-app-text shadow-sm transition-all"
  >
    <div class="no-scrollbar flex flex-1 items-center gap-5 overflow-x-auto">
      <div class="mr-2 shrink-0 text-[9px] font-black uppercase tracking-widest text-app-muted">
        Workflow<br />Timeline
      </div>

      <div class="flex items-center">
        <template v-for="(step, i) in steps" :key="'summary-' + i">
          <button
            @click="$emit('scrollToStep', i)"
            class="group relative flex shrink-0 items-center gap-2.5 rounded-[20px] border border-app-border px-4 py-3 text-app-text shadow-sm transition-all hover:border-emerald-200 hover:bg-app-panel"
            :style="{ opacity: Math.max(0.6, 1 - i * 0.08) }"
          >
            <div
              :class="[
                'rounded-lg p-1.5 transition-colors',
                step.type === 'call'
                  ? 'bg-blue-500/10 text-blue-500'
                  : step.type === 'email'
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'bg-emerald-500/10 text-emerald-500'
              ]"
            >
              <component
                :is="step.type === 'call' ? Phone : step.type === 'email' ? Mail : MessageSquare"
                class="h-3.5 w-3.5"
              />
            </div>
            <div class="flex flex-col items-start leading-tight">
              <span class="whitespace-nowrap text-xs font-black text-app-text">{{
                step.title || step.type + ' ' + (i + 1)
              }}</span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600"
                >Day {{ cumulativeDays[i] }}</span
              >
            </div>
          </button>

          <div
            v-if="i < steps.length - 1"
            class="mx-2 h-0.5 w-8 shrink-0 rounded-full bg-app-panel"
          ></div>
        </template>
      </div>
    </div>
  </div>
</template>
