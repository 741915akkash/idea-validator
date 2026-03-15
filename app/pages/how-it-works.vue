<script setup>
  import Button from '~/components/ui/Button.vue'
  import { navigateTo } from '#app'

  const beginValidation = () => {
    navigateTo('/quiz/overview')
  }
</script>

<template>
  <main class="px-6 py-6">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-2 text-2xl font-semibold">How this validation works</h1>

      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <!-- Section: What this does -->
      <section class="mb-8 space-y-3 text-base text-gray-700">
        <p>This tool evaluates your idea using a fixed set of criteria across 9 checkpoints.</p>

        <p>Your answers are mapped to numeric scores. Those scores produce:</p>

        <ul class="list-disc pl-5">
          <li>Market Score (idea viability)</li>
          <li>Confidence Score (execution readiness)</li>
        </ul>
      </section>

      <!-- Section: How scoring works -->
      <section class="mb-8 space-y-3 text-base text-gray-700">
        <p class="font-medium text-gray-900">How scoring works</p>

        <p>
          Every question has predefined scoring. There is no interpretation, no AI, and no advice
          layer.
        </p>

        <p>Same answers → same result.</p>
      </section>

      <!-- Section: What this does not do -->
      <section class="mb-8 space-y-3 text-base text-gray-700">
        <p class="font-medium text-gray-900">What this does not do</p>

        <ul class="list-disc pl-5">
          <li>Predict success</li>
          <li>Judge you or your idea</li>
          <li>Replace customer research</li>
          <li>Tell you what to build</li>
        </ul>
      </section>

      <!-- Section: Control & safety -->
      <section class="mb-10 space-y-3 text-base text-gray-700">
        <p class="font-medium text-gray-900">Your control & safety</p>

        <p>You can pause and resume at any time.</p>

        <p>
          Once results are generated, they are locked to preserve objectivity. You can always run a
          new validation with different assumptions.
        </p>
      </section>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <Button @click="beginValidation"> Begin validation </Button>

        <NuxtLink to="/" class="text-base text-gray-600 hover:underline"> Go back </NuxtLink>
      </div>
    </div>
  </main>
</template>
