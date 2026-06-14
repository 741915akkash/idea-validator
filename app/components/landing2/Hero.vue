<template>
  <header
    class="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 pb-20 pt-16 md:pb-24 md:pt-36"
  >
    <div class="relative mx-auto max-w-4xl text-center">
      <!-- H1 -->
      <h1
        class="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Validate Your Idea
        <span class="relative mt-2 inline-block text-emerald-600">
          Before You Build
          <span
            class="absolute bottom-1 left-0 -z-10 h-[6px] w-full rounded-full bg-emerald-500/10"
          />
        </span>
      </h1>

      <!-- Subheadline -->
      <p
        class="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl md:text-2xl"
      >
        Break your idea into clear assumptions and validate them through real customer
        conversations—so you know exactly what to build next.
      </p>

      <!-- CTA -->
      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          @click="startValidation"
          class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700 sm:px-8 sm:py-4 sm:text-lg"
        >
          Start Validation

          <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <p class="mt-5 text-sm font-medium text-slate-500 sm:text-base">
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
