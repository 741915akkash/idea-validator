<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScoreCircle from '~/components/ui/ScoreCircle.vue'

const route = useRoute()
const router = useRouter()

// ✅ support BOTH /quiz/score?quiz_id=
// and /result/[quiz_id]
const quizId =
  route.query.quiz_id ||
  route.params.quiz_id ||
  null

const loading = ref(true)
const result = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    if (!quizId) {
      router.replace('/quiz/overview')
      return
    }

    // 1️⃣ Try existing result
    const existing = await $fetch('/api/quiz/result', {
      query: { quiz_id: quizId }
    })

    if (existing) {
      result.value = existing
      return
    }

    // 2️⃣ Otherwise score now
    const scored = await $fetch('/api/quiz/score', {
      method: 'POST',
      body: { quiz_id: quizId }
    })

    result.value = scored
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
})

// ✅ STRONG guard
const ready = computed(() =>
  !loading.value &&
  result.value &&
  result.value.summary
)
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">

      <!-- Loading -->
      <p v-if="loading" class="text-sm text-gray-600">
        Finalizing your results…
      </p>

      <!-- Error -->
      <div v-else-if="error" class="text-sm text-red-600">
        Something went wrong while scoring.
      </div>

      <!-- ✅ SAFE RENDER -->
      <div v-else-if="ready">

        <!-- Scores -->
        <section class="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
          <ScoreCircle
            :value="result.market_score"
            label="Market Score"
            color-class="text-emerald-600"
          />

          <ScoreCircle
            :value="result.confidence_score"
            label="Confidence Score"
            color-class="text-blue-600"
          />
        </section>

        <!-- Decision -->
        <h1 class="text-2xl font-semibold mb-2">
          Decision: {{ result.decision.replaceAll('_', ' ') }}
        </h1>

        <p class="text-sm text-gray-600 mb-8">
          Based on your answers across all checkpoints.
        </p>

        <!-- Market Breakdown -->
        <section class="mb-10">
          <h2 class="text-sm font-medium mb-3">
            Market breakdown
          </h2>

          <ul class="space-y-2 text-sm">
            <li
              v-for="(value, checkpoint) in result.summary.market_breakdown"
              :key="checkpoint"
              class="flex justify-between border rounded px-4 py-2"
            >
              <span>Checkpoint {{ checkpoint }}</span>
              <span class="text-gray-600">{{ value }}</span>
            </li>
          </ul>
        </section>

        <!-- Confidence Breakdown -->
        <section class="mb-10">
          <h2 class="text-sm font-medium mb-3">
            Confidence breakdown
          </h2>

          <ul class="space-y-2 text-sm">
            <li
              v-for="(value, key) in result.summary.confidence_breakdown"
              :key="key"
              class="flex justify-between border rounded px-4 py-2"
            >
              <span class="capitalize">
                {{ key.replaceAll('_', ' ') }}
              </span>
              <span class="text-gray-600">{{ value }}</span>
            </li>
          </ul>
        </section>

        <!-- Footer -->
        <p class="text-xs text-gray-500 mb-8">
          Results are locked to preserve objectivity.
          You can run a new validation at any time.
        </p>

        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-sm text-emerald-700 hover:underline">
            Start new validation
          </NuxtLink>
        </div>
      </div>

    </div>
  </main>
</template>
