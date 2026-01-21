<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import ScoreCircle from '~/components/ui/ScoreCircle.vue'

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()
  const revisionDiff = ref([])

  const quizId = route.query.quiz_id || route.params.quiz_id || null

  const loading = ref(true)
  const result = ref(null)
  const error = ref(null)

  onMounted(async () => {
    try {
      if (!quizId) {
        router.replace('/quiz/overview')
        return
      }

      // ✅ ONLY read existing result
      const existing = await $fetch('/api/quiz/result', {
        query: { quiz_id: quizId }
      })

      if (!existing) {
        // 🔒 No score yet → overview decides what to do
        router.replace('/quiz/overview')
        return
      }

      // fetch revision diff (safe even for revision_number = 0)
      const res = await $fetch('/api/quiz/revision-diff', {
        query: { quiz_id: quizId }
      })

      revisionDiff.value = res.changes || []

      result.value = existing
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })

  const ready = computed(() => result.value && result.value.summary)

  async function startNewRevision() {
    if (!quizId) return
    await quizStore.startRevision(quizId)
  }
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">
      <!-- Loading -->
      <p v-if="loading" class="text-sm text-gray-600">Loading your results…</p>

      <!-- Error -->
      <div v-else-if="error" class="text-sm text-red-600">
        Something went wrong while loading the score.
      </div>

      <!-- ✅ SAFE RENDER (score exists) -->
      <div v-else-if="ready">
        <!-- Scores -->
        <section class="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
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
        <h1 class="mb-2 text-2xl font-semibold">
          Decision: {{ result.decision.replaceAll('_', ' ') }}
        </h1>

        <p class="mb-8 text-sm text-gray-600">Based on your answers across all checkpoints.</p>

        <!-- Market Breakdown -->
        <section class="mb-10">
          <h2 class="mb-3 text-sm font-medium">Market breakdown</h2>

          <ul class="space-y-2 text-sm">
            <li
              v-for="(value, checkpoint) in result.summary.market_breakdown"
              :key="checkpoint"
              class="flex justify-between rounded border px-4 py-2"
            >
              <span>Checkpoint {{ checkpoint }}</span>
              <span class="text-gray-600">{{ value }}</span>
            </li>
          </ul>
        </section>

        <!-- Confidence Breakdown -->
        <section class="mb-10">
          <h2 class="mb-3 text-sm font-medium">Confidence breakdown</h2>

          <ul class="space-y-2 text-sm">
            <li
              v-for="(value, key) in result.summary.confidence_breakdown"
              :key="key"
              class="flex justify-between rounded border px-4 py-2"
            >
              <span class="capitalize">
                {{ key.replaceAll('_', ' ') }}
              </span>
              <span class="text-gray-600">{{ value }}</span>
            </li>
          </ul>
        </section>

        <!-- 🔍 Revision changes -->
        <section v-if="revisionDiff.length" class="mt-12 border-t pt-8">
          <h2 class="mb-4 text-sm font-semibold">What changed in this revision</h2>

          <div
            v-for="change in revisionDiff"
            :key="change.question_id"
            class="mb-6 rounded border p-4"
          >
            <!-- Checkpoint -->
            <p class="mb-1 text-xs text-gray-500">Checkpoint {{ change.checkpoint }}</p>

            <!-- Question -->
            <p class="mb-3 text-sm font-medium">
              {{ change.question_text }}
            </p>

            <!-- Main option -->
            <div v-if="change.main_option.previous !== change.main_option.current" class="mb-3">
              <p class="mb-1 text-xs font-medium text-gray-600">Option</p>

              <div class="grid grid-cols-2 gap-6 text-sm">
                <!-- Previous -->
                <div class="text-gray-400">
                  {{ change.main_option.previous ?? '—' }}
                </div>

                <!-- Current -->
                <div class="font-medium text-gray-900">
                  {{ change.main_option.current ?? '—' }}
                </div>
              </div>
            </div>

            <!-- ASQs -->
            <div v-if="change.asqs.previous.length || change.asqs.current.length" class="mb-4">
              <p class="mb-1 text-xs font-medium text-gray-600">Follow-up answers</p>

              <ul class="space-y-3">
                <li v-for="(prev, i) in change.asqs.previous" :key="i">
                  <p class="mb-1 text-xs text-gray-500">
                    {{ prev.text }}
                  </p>

                  <div class="grid grid-cols-2 gap-6 text-xs">
                    <!-- Previous -->
                    <div class="text-gray-400">
                      {{ prev.value ?? '—' }}
                    </div>

                    <!-- Current -->
                    <div class="font-medium text-gray-900">
                      {{ change.asqs.current[i]?.value ?? '—' }}
                    </div>
                  </div>
                </li>

                <!-- Newly added ASQs (no previous) -->
                <li
                  v-for="(curr, i) in change.asqs.current.slice(change.asqs.previous.length)"
                  :key="'new-' + i"
                >
                  <p class="mb-1 text-xs text-gray-500">
                    {{ curr.text }}
                  </p>

                  <div class="grid grid-cols-2 gap-6 text-xs">
                    <div class="text-gray-400">—</div>
                    <div class="font-medium text-gray-900">
                      {{ curr.value }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Notes -->
            <div v-if="change.notes.previous.length || change.notes.current.length" class="mb-2">
              <p class="mb-1 text-xs font-medium text-gray-600">Notes</p>

              <div class="grid grid-cols-2 gap-6 text-xs">
                <!-- Previous -->
                <div class="whitespace-pre-wrap text-gray-400">
                  {{ change.notes.previous.join('; ') || '—' }}
                </div>

                <!-- Current -->
                <div class="whitespace-pre-wrap font-medium text-gray-900">
                  {{ change.notes.current.join('; ') || '—' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <p class="mb-8 text-xs text-gray-500">Results are locked to preserve objectivity.</p>

        <!-- Actions -->
        <div class="flex items-center gap-6">
          <button
            class="text-sm font-medium text-indigo-600 hover:underline"
            @click="startNewRevision"
          >
            Start new revision
          </button>

          <NuxtLink to="/quiz/overview" class="text-sm text-gray-600 hover:underline">
            Back to overview
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
