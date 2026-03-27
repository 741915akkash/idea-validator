<script setup>
  import { ArrowDown, ArrowRight, RefreshCw } from 'lucide-vue-next'

  definePageMeta({
    layout: 'marketing'
  })

  const loopSteps = [
    { id: 1, name: 'Idea', example: 'Idea: AI fitness app for busy people' },
    { id: 2, name: 'Confidence Score', example: 'Confidence Score: Low — not sure people will pay' },
    { id: 3, name: 'Key assumptions', example: 'Assumption: Users will pay ₹500/month' },
    { id: 4, name: 'Key uncertainties', example: 'Uncertainty: Are they already using alternatives?' },
    { id: 5, name: 'Testable questions', example: 'Testable question: "Would you pay ₹500/month?" -> Yes / No' },
    { id: 6, name: 'Real user interviews', example: 'Interviews: Talked to 10 users' },
    { id: 7, name: 'Learnings & decision', example: 'Learnings: 7 said no.' }
  ]
</script>

<template>
  <section class="mx-auto mt-20 max-w-4xl px-6 pb-24">
    <h2 class="mb-8 text-center text-3xl font-extrabold text-slate-900">
      Here's what validating an idea actually looks like
    </h2>
    <div
      class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"
    >
      <!-- Header -->
      <div
        class="mb-12 flex flex-col gap-2 border-b border-slate-100 pb-6 sm:grid sm:grid-cols-2 sm:gap-12"
      >
        <h3 class="text-center text-sm font-black uppercase tracking-[0.3em] text-emerald-600">
          Process
        </h3>
        <h3
          class="text-center text-sm font-black uppercase tracking-[0.3em] text-slate-400 sm:pl-6 sm:text-left"
        >
          Example
        </h3>
      </div>

      <!-- LOOP STEPS -->
      <div class="flex flex-col">
        <div v-for="(step, index) in loopSteps" :key="step.id" class="group/row flex flex-col">
          <!-- Step Row -->
          <div
            class="-mx-4 grid grid-cols-1 items-stretch gap-1 rounded-xl px-4 transition-colors duration-300 group-hover/row:bg-slate-50/50 sm:grid-cols-2 sm:gap-12"
          >
            <!-- Left Side: Process -->
            <div class="relative flex items-center justify-center py-2 text-center sm:py-3">
              <p class="text-base font-bold text-slate-900">{{ step.name }}</p>
              <!-- Horizontal Connector (Desktop) -->
              <div
                class="absolute -right-12 top-1/2 hidden w-12 -translate-y-1/2 border-t border-slate-100 sm:block"
              ></div>
            </div>

            <!-- Right Side: Example -->
            <div
              class="relative flex flex-col items-center justify-center border-l-0 border-slate-100 py-1 text-center text-sm leading-relaxed text-slate-900 sm:items-start sm:border-l sm:border-emerald-100/50 sm:py-3 sm:pl-6 sm:text-left sm:text-base"
            >
              <!-- Connection Dot (Desktop) -->
              <div
                class="absolute -left-[2.5px] top-1/2 hidden h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-emerald-300 sm:block"
              ></div>
              {{ step.example }}
            </div>
          </div>

          <!-- Arrow Row (Between Steps) -->
          <div
            v-if="index < loopSteps.length - 1"
            class="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-12"
          >
            <div class="flex justify-center py-1">
              <ArrowDown class="h-4 w-4 stroke-[3] text-emerald-500" />
            </div>
            <div
              class="hidden border-l border-slate-100 sm:ml-6 sm:block sm:border-emerald-100/50"
            ></div>
          </div>
        </div>

        <!-- FINAL DECISION ROW -->
        <div
          class="relative mt-8 grid grid-cols-1 items-stretch gap-4 border-t border-dashed border-slate-200 pt-8 sm:mt-12 sm:grid-cols-2 sm:gap-12 sm:pt-12"
        >
          <div class="flex items-center justify-center font-black text-emerald-600">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-emerald-50 p-2">
                <RefreshCw class="h-4 w-4" />
              </div>
              <span class="text-[10px] uppercase tracking-widest">Iterate or pivot</span>
            </div>
          </div>

          <div
            class="flex items-center justify-center gap-3 rounded-xl border border-emerald-100/50 bg-emerald-50/50 p-4 text-sm font-bold text-emerald-700"
          >
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
              <ArrowRight class="h-3 w-3 text-emerald-500" />
            </div>
            <span>Decision: Pivot pricing & positioning</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 text-center">
      <p class="text-sm font-medium text-slate-700">
        Want to see exactly how this works step-by-step?
      </p>
      <NuxtLink
        to="/how-it-works"
        class="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold leading-6 text-white shadow-sm transition-all hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        View full system <ArrowRight class="h-5 w-5" />
      </NuxtLink>
    </div>
  </section>
</template>
