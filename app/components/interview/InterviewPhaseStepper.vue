<!-- app/components/interview/InterviewPhaseStepper.vue -->

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    currentPhase: {
      type: String,
      required: true
    }
  })

  const phases = [
    { key: 'uncertainty', label: 'Uncertainty' },
    { key: 'goal', label: 'Goal' },
    { key: 'resolve', label: 'Resolution' },
    { key: 'complete', label: 'Complete' }
  ]

  const currentIndex = computed(() => phases.findIndex((p) => p.key === props.currentPhase))
</script>

<template>
  <div>
    <!-- MOBILE STEPPER -->
    <div class="flex items-center justify-between sm:hidden">
      <div v-for="(phase, index) in phases" :key="phase.key" class="flex flex-1 items-center">
        <!-- Step Circle -->
        <div
          :class="[
            'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
            index <= currentIndex
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-neutral-300 text-neutral-400'
          ]"
        >
          {{ index + 1 }}
        </div>

        <!-- Connector -->
        <div
          v-if="index !== phases.length - 1"
          :class="['mx-2 h-px flex-1', index < currentIndex ? 'bg-emerald-600' : 'bg-neutral-200']"
        ></div>
      </div>
    </div>

    <!-- DESKTOP STEPPER -->
    <div class="hidden items-center justify-between sm:flex">
      <div v-for="(phase, index) in phases" :key="phase.key" class="flex flex-1 items-center">
        <!-- Step Indicator -->
        <div class="flex items-center">
          <div
            :class="[
              'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
              index <= currentIndex
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : index === currentIndex
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-neutral-300 text-neutral-400'
            ]"
          >
            {{ index + 1 }}
          </div>

          <div
            :class="[
              'ml-3 text-sm font-medium',
              index <= currentIndex ? 'text-neutral-900' : 'text-neutral-400'
            ]"
          >
            {{ phase.label }}
          </div>
        </div>

        <!-- Connector -->
        <div
          v-if="index !== phases.length - 1"
          :class="['mx-4 h-px flex-1', index < currentIndex ? 'bg-neutral-900' : 'bg-neutral-200']"
        ></div>
      </div>
    </div>
  </div>
</template>
