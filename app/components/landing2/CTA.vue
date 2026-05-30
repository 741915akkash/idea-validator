<template>
  <section id="cta-section" class="bg-white px-6 py-24 text-center">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Validate without wasting time and money.
      </h2>

      <button
        class="group rounded-xl bg-emerald-600 px-10 py-5 text-xl font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
        @click="startValidation"
      >
        Start Validating Free
      </button>

      <p class="mt-8 text-sm font-medium text-slate-500">
        No credit card required. Start building with confidence today.
      </p>
    </div>
  </section>
</template>

<script setup>
  const { $posthog } = useNuxtApp()

  function startValidation() {
    const posthog = typeof $posthog === 'function' ? $posthog() : $posthog
    posthog?.capture?.('start_validation_clicked')
    navigateTo('/quiz/overview')
  }
</script>
