<template>
  <header
    class="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 pb-24 pt-20 md:pt-36"
  >
    <div class="relative mx-auto max-w-4xl text-center">
      <!-- H1 -->
      <h1
        class="mb-8 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl"
      >
        Validate Your Idea
        <span class="relative mt-2 inline-block text-emerald-600">
          Before You Build
          <span class="absolute bottom-1 left-0 -z-10 h-[6px] w-full rounded-full bg-emerald-100" />
        </span>
      </h1>

      <!-- Subheadline -->
      <p class="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-slate-700 md:text-2xl">
        Break your idea into clear assumptions and validate them through real customer
        conversations—so you know exactly what to build next.
      </p>

      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          class="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1 hover:bg-emerald-700"
        >
          Start Validating
          <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <p class="mt-6 text-base font-semibold text-slate-600">
        No guesswork. Just structured validation.
      </p>
    </div>
  </header>
</template>

<script setup>
  import { ArrowRight } from 'lucide-vue-next'
  const { $posthog } = useNuxtApp()

  function startValidation() {
    const posthog = typeof $posthog === 'function' ? $posthog() : $posthog
    posthog?.capture?.('start_validation_clicked')
    navigateTo('/quiz/overview')
  }
</script>
