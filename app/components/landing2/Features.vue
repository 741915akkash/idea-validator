<template>
  <section class="px-6 py-20">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-4 text-center text-3xl font-extrabold text-slate-900">
        What Idea Validator Actually Does
      </h2>
      <p class="mb-12 text-center text-sm font-medium uppercase text-slate-500">
        Not an Idea Checker. A Validation System.
      </p>

      <div class="grid gap-6">
        <div
          v-for="(item, i) in features"
          :key="i"
          class="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:border-emerald-200"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <component :is="item.icon" class="h-5 w-5 text-emerald-600" />
          </div>
          <span class="font-semibold text-slate-700">{{ item.text }}</span>
        </div>
      </div>

      <div class="mt-12 rounded-2xl bg-emerald-600 p-6 text-center text-white">
        <p class="text-lg font-bold">"You don't get random advice. You get structure."</p>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { Target, Zap, BarChart3, ShieldCheck, Clock, TrendingUp } from 'lucide-vue-next'

  const features = [
    { icon: Target, text: 'Breaks it into core assumptions' },
    { icon: Zap, text: 'Identifies the most critical uncertainties' },
    { icon: BarChart3, text: 'Ranks what must be validated first' },
    { icon: ShieldCheck, text: 'Converts doubts into testable conditions' },
    { icon: Clock, text: 'Tracks your validation progress over time' },
    { icon: TrendingUp, text: 'Updates your confidence score as evidence grows' }
  ]
</script>
