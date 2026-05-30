<script setup>
  import { ArrowDown, ArrowRight, RefreshCw } from 'lucide-vue-next'

  defineEmits(['start'])

  const loopSteps = [
    { id: 1, name: 'Idea', example: 'Idea: AI fitness app for busy people' },
    {
      id: 2,
      name: 'Confidence Score',
      example: 'Confidence Score: Low — not sure people will pay'
    },
    {
      id: 3,
      name: 'Key assumptions',
      example: 'Assumption: Users will pay $50/month'
    },
    {
      id: 4,
      name: 'Key uncertainties',
      example: 'Uncertainty: Are they already using alternatives?'
    },
    {
      id: 5,
      name: 'Testable questions',
      example: 'Testable question: "Would you pay $50/month?" → Yes / No'
    },
    {
      id: 6,
      name: 'Real user interviews',
      example: 'Interviews: Talked to 10 users'
    },
    {
      id: 7,
      name: 'Learnings & decision',
      example: 'Learnings: 7 said no.'
    }
  ]
</script>

<template>
  <section id="light-explanation-section" class="mx-auto max-w-4xl px-6 py-20">
    <h2 class="mb-10 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
      How Validation Works
    </h2>
    <div
      class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-12"
    >
      <!-- Header -->
      <div
        class="mb-12 flex flex-col gap-2 border-b border-slate-100 pb-6 sm:grid sm:grid-cols-2 sm:gap-12"
      >
        <h3 class="text-center text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">
          Process Step
        </h3>

        <h3
          class="text-center text-sm font-bold uppercase tracking-[0.3em] text-slate-400 sm:pl-6 sm:text-left"
        >
          Real Example
        </h3>
      </div>

      <!-- LOOP STEPS -->
      <div class="flex flex-col">
        <div v-for="(step, index) in loopSteps" :key="step.id" class="group/row flex flex-col">
          <!-- Step Row -->
          <div
            class="-mx-4 grid grid-cols-1 items-stretch gap-1 rounded-xl px-4 transition-colors duration-300 hover:bg-slate-50/50 sm:grid-cols-2 sm:gap-12"
          >
            <!-- Left -->
            <div class="relative flex items-center justify-center py-3 text-center sm:py-4">
              <p class="text-lg font-semibold text-slate-900">
                {{ step.name }}
              </p>

              <div
                class="absolute -right-12 top-1/2 hidden w-12 -translate-y-1/2 border-t border-slate-200 sm:block"
              />
            </div>

            <!-- Right -->
            <div
              class="relative flex flex-col items-center justify-center border-l-0 border-slate-100 py-1.5 text-center text-sm font-medium leading-relaxed text-slate-700 sm:items-start sm:border-l sm:border-emerald-200 sm:py-3.5 sm:pl-6 sm:text-left sm:text-base"
            >
              <div
                class="absolute -left-[3px] top-1/2 hidden h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-emerald-500 sm:block"
              />

              {{ step.example }}
            </div>
          </div>

          <!-- Arrow -->
          <div
            v-if="index < loopSteps.length - 1"
            class="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-12"
          >
            <div class="flex justify-center py-1">
              <ArrowDown class="h-4 w-4 stroke-[3] text-emerald-500" />
            </div>

            <div
              class="hidden border-l border-slate-100 sm:ml-6 sm:block sm:border-emerald-100/50"
            />
          </div>
        </div>

        <!-- Final Decision -->
        <div
          class="relative mt-8 grid grid-cols-1 items-stretch gap-4 border-t border-dashed border-slate-200 pt-8 sm:mt-12 sm:grid-cols-2 sm:gap-12 sm:pt-12"
        >
          <div class="flex items-center justify-center text-emerald-600">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <RefreshCw class="h-4 w-4" />
              </div>

              <span class="text-xs font-bold uppercase tracking-widest"> Iterate or pivot </span>
            </div>
          </div>

          <div
            class="flex items-center justify-center gap-3 rounded-xl border border-emerald-100/50 bg-emerald-50/50 p-4 text-sm font-semibold text-emerald-700"
          >
            <div
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <ArrowRight class="h-3 w-3 text-emerald-500" />
            </div>

            <span>Decision: Pivot pricing & positioning</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 text-center">
      <p class="text-base font-semibold text-slate-800 sm:text-lg">
        Want to see exactly how this works step-by-step?
      </p>

      <button
        @click="$emit('start')"
        class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-emerald-700"
      >
        View full system
        <ArrowRight class="h-5 w-5" />
      </button>
    </div>
  </section>
</template>
