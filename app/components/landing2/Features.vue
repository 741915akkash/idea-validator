<template>
  <section class="px-6 py-20">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-4 text-center text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
        What Idea Validator Actually Does
      </h2>
      <p class="mb-12 text-center text-base font-semibold tracking-wide text-slate-900 sm:text-lg">
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
          <span class="text-base font-medium leading-relaxed text-slate-900 sm:text-lg">{{ item.text }}</span>
        </div>
      </div>

      <div class="mt-12 rounded-2xl bg-emerald-600 p-6 text-center text-white">
        <p class="text-lg font-bold leading-relaxed sm:text-xl">"You don't get random advice. You get structure."</p>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { Target, Zap, BarChart3, ShieldCheck, Clock, TrendingUp } from 'lucide-vue-next'

  const features = [
    { icon: Target, text: 'Turn your idea into clear assumptions you can test' },
    { icon: Zap, text: 'Know what could kill your idea before you build' },
    { icon: BarChart3, text: 'Focus on the most important things to validate first' },
    { icon: ShieldCheck, text: 'Turn doubts into simple questions you can ask users' },
    { icon: Clock, text: "See what's working — based on real feedback" },
    { icon: TrendingUp, text: 'Gain confidence as you collect real evidence' }
  ]
</script>
