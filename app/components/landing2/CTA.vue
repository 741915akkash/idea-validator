<template>
  <section class="py-32 px-6 text-center">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-4xl font-extrabold mb-6 text-slate-900">Validate without wasting time and money.</h2>
      <button class="bg-emerald-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 mb-8" @click="posthog?.capture('start_validation_clicked')">
        Start Validating Free
      </button>
      <p class="text-slate-500 font-medium">No credit card required. Start building with confidence today.</p>
    </div>
  </section>
</template>

<script setup>
  const posthog = usePostHog()
</script>
