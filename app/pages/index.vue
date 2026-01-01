<script setup>
  import Button from '~/components/ui/Button.vue'
</script>

<template>
  <main class="flex flex-1 items-center justify-center px-6">
    <div class="w-full max-w-xl text-center">
      <h1 class="mb-2 text-2xl font-semibold">Validate before you build.</h1>

      <div class="mx-auto mb-6 h-1 w-12 bg-emerald-500"></div>

      <p class="mb-8 text-sm text-gray-600">
        Answer a structured set of questions to objectively assess market viability and execution
        readiness.
      </p>

      <Button to="/how-it-works"> Start validation </Button>
    </div>
  </main>

  <section class="border-t px-6 py-12">
    <div class="mx-auto max-w-xl space-y-3 text-sm text-gray-700">
      <p>• 9 structured checkpoints</p>
      <p>• Deterministic scoring</p>
      <p>• Market score + confidence score</p>
      <p>• Clear build / refine / do not build decision</p>
    </div>
  </section>

  <footer class="border-t px-6 py-4 text-xs text-gray-500">
    Deterministic. No AI. Same inputs → same outcome.
  </footer>
</template>
