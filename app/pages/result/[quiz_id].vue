<script setup>
import { useRoute } from 'vue-router'
import Button from '~/components/ui/Button.vue'

const route = useRoute()
const quizId = route.params.quiz_id

const { data: result } = await useFetch(
  `/api/quiz/result?quiz_id=${quizId}`
)

/*
Expected result shape (example, backend-owned):
{
  decision: 'BUILD' | 'REFINE' | 'DO_NOT_BUILD',
  market_score: number,
  confidence_score: number,
  checkpoints: [
    { checkpoint: 1, label: 'Strong' }
  ]
}
*/
</script>

<template>
  <main class="px-6 py-16">
    <div class="max-w-2xl mx-auto">
      <!-- Decision -->
      <h1 class="text-2xl font-semibold mb-1">
        Decision: {{ result.decision.replaceAll('_', ' ') }}
      </h1>

      <p class="text-sm text-gray-600 mb-6">
        Based on your answers across all checkpoints.
      </p>

      <div class="h-1 w-16 bg-emerald-500 mb-8"></div>

      <!-- Scores -->
      <section class="grid grid-cols-2 gap-6 mb-10">
        <div class="border rounded p-4">
          <p class="text-sm font-medium">Market Score</p>
          <p class="text-xs text-gray-600 mb-2">
            External viability
          </p>
          <p class="text-lg font-semibold">
            {{ result.market_score }} / 100
          </p>
        </div>

        <div class="border rounded p-4">
          <p class="text-sm font-medium">Confidence Score</p>
          <p class="text-xs text-gray-600 mb-2">
            Execution readiness
          </p>
          <p class="text-lg font-semibold">
            {{ result.confidence_score }} / 100
          </p>
        </div>
      </section>

      <!-- Meaning -->
      <section class="mb-10 text-sm text-gray-700 space-y-2">
        <p v-if="result.decision === 'BUILD'">
          Current conditions support moving forward.
          Market signals and execution readiness are aligned.
        </p>

        <p v-else-if="result.decision === 'REFINE'">
          The idea shows potential, but conditions are not fully aligned yet.
          Refinement may improve viability or execution readiness.
        </p>

        <p v-else>
          Current conditions do not support building this idea at this time.
          This reflects constraints, not the value of the idea itself.
        </p>
      </section>

      <!-- Checkpoint breakdown -->
      <section class="mb-10">
        <p class="text-sm font-medium mb-3">
          Checkpoint breakdown
        </p>

        <ul class="space-y-2 text-sm">
          <li
            v-for="c in result.checkpoints"
            :key="c.checkpoint"
            class="flex justify-between border rounded px-4 py-2"
          >
            <span>Checkpoint {{ c.checkpoint }}</span>
            <span class="text-gray-600">{{ c.label }}</span>
          </li>
        </ul>
      </section>

      <!-- Footer -->
      <p class="text-xs text-gray-500 mb-8">
        Results are locked to preserve objectivity.
        You can run a new validation with different assumptions at any time.
      </p>

      <div class="flex items-center gap-4">
        <Button to="/">
          Start new validation
        </Button>

        <NuxtLink to="/" class="text-sm text-gray-600 hover:underline">
          Home
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
