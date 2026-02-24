<template>
  <section class="px-6 py-20">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-12 text-center text-3xl font-extrabold text-slate-900">
        Why Not Just Use ChatGPT?
      </h2>
      <div class="space-y-6">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            Standard AI Tools
          </h3>
          <ul class="space-y-3">
            <li
              v-for="(item, i) in standardAi"
              :key="i"
              class="flex items-center gap-3 text-slate-500"
            >
              <XCircle class="h-4 w-4 shrink-0" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
        <div
          class="rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-xl shadow-emerald-100"
        >
          <h3 class="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-600">
            Idea Validator
          </h3>
          <ul class="space-y-3">
            <li
              v-for="(item, i) in ideaValidator"
              :key="i"
              class="flex items-center gap-3 font-medium text-slate-800"
            >
              <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
      <p class="mt-12 text-center font-medium italic text-slate-500">
        "Why Not Just Read Books or Take Courses? Because knowledge isn't the bottleneck. Execution
        is."
      </p>
    </div>
  </section>
</template>

<script setup>
  import { XCircle, CheckCircle2 } from 'lucide-vue-next'

  const standardAi = [
    'Reacts to what you ask',
    'Gives generic "good idea" feedback',
    'No memory of your progress'
  ]

  const ideaValidator = [
    "Proactively tells you what's missing",
    'Forces you to confront risky assumptions',
    'Builds a persistent roadmap of evidence'
  ]
</script>
