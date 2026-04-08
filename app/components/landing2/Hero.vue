<template>
  <header class="px-6 pb-24 pt-20 md:pt-40">
    <div class="mx-auto max-w-3xl text-center">
      <!-- H1: primary keyword + intent -->
      <h1 class="mb-6 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
        Validate Your Idea
        <span class="text-emerald-600">Before You Build</span>
      </h1>

      <!-- Subheadline: expands keywords + explains system -->
      <p class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-600">
        Break your idea into clear assumptions and validate them through real customer
        conversations—so you know exactly what to build next.
      </p>

      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 sm:w-auto"
          @click="startValidation"
        >
          Start Validating <ArrowRight class="h-5 w-5" />
        </button>
      </div>
      <p class="mt-6 text-sm text-slate-500">No guesswork. Just structured validation.</p>
    </div>
  </header>
</template>

<script setup>
  import { ArrowRight } from 'lucide-vue-next'
  const { $posthog } = useNuxtApp()

  function startValidation() {
    $posthog?.capture('start_validation_clicked')
    navigateTo('/quiz/overview')
  }
</script>
