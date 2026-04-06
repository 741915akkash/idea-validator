<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import ScoreCircle from '~/components/ui/ScoreCircle.vue'
  import InsightBlock from '~/components/score/InsightBlock.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  const quizId = route.query.quiz_id || route.params.quiz_id || null

  // --------------------
  // Core score state
  // --------------------
  const loading = ref(true)
  const result = ref(null)
  const error = ref(null)

  // --------------------
  // Revision diff
  // --------------------
  const revisionDiff = ref([])

  // --------------------
  // 🔹 NEW: Insights state
  // --------------------
  const loadingInsights = ref(true)
  const insightsError = ref(null)
  const insightsLocked = ref(false)

  const insights = ref({
    working: [],
    risky: [],
    proceed: []
  })

  onMounted(async () => {
    try {
      if (!quizId) {
        router.replace('/quiz/overview')
        return
      }

      // ✅ 1️⃣ Fetch immutable score result
      const existing = await $fetch('/api/quiz/lifecycle/result', {
        query: { quiz_id: quizId }
      })

      if (!existing) {
        router.replace('/quiz/overview')
        return
      }

      result.value = existing

      // ✅ 2️⃣ Fetch revision diff (safe even for original quiz)
      const diffRes = await $fetch('/api/quiz/revision/revision-diff', {
        query: { quiz_id: quizId }
      })

      revisionDiff.value = diffRes.changes || []

      // ✅ 3️⃣ Fetch insights (STEP 4)
      try {
        const insightsRes = await $fetch('/api/quiz/test-insights', {
          query: { quiz_id: quizId }
        })

        insightsLocked.value = Boolean(insightsRes.locked)
        insights.value = insightsRes.insights || {
          working: [],
          risky: [],
          proceed: []
        }
        console.log('Loaded insights:', insights.value)
      } catch (e) {
        // Insights failure should NOT break score page
        insightsError.value = 'Failed to load insights'
        console.error(e)
      }
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
      loadingInsights.value = false
    }
  })

  // --------------------
  // Computed helpers
  // --------------------
  const ready = computed(() => result.value && result.value.summary)

  // --------------------
  // Actions
  // --------------------
  async function startNewRevision() {
    if (!quizId) return
    await quizStore.startRevision(quizId)
  }
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">
      <!-- Loading -->
      <p v-if="loading" class="text-base text-gray-600">Loading your results…</p>

      <!-- Error -->
      <div v-else-if="error" class="text-base text-red-600">
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

        <p class="mb-8 text-base text-gray-600">Based on your answers across all checkpoints.</p>

        <!-- Market Breakdown -->
        <section class="mb-10">
          <h2 class="mb-3 text-base font-medium">Market breakdown</h2>

          <ul class="space-y-2 text-base">
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
          <h2 class="mb-3 text-base font-medium">Confidence breakdown</h2>

          <ul class="space-y-2 text-base">
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
          <h2 class="mb-4 text-base font-semibold">What changed in this revision</h2>

          <div
            v-for="change in revisionDiff"
            :key="change.question_id"
            class="mb-6 rounded border p-4"
          >
            <!-- Checkpoint -->
            <p class="mb-1 text-xs text-gray-500">Checkpoint {{ change.checkpoint }}</p>

            <!-- Question -->
            <p class="mb-3 text-base font-medium">
              {{ change.question_text }}
            </p>

            <!-- Main option -->
            <div v-if="change.main_option.previous !== change.main_option.current" class="mb-3">
              <p class="mb-1 text-xs font-medium text-gray-600">Option</p>

              <div class="grid grid-cols-2 gap-6 text-base">
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

        <section v-if="!loadingInsights && !insightsError && !insightsLocked" class="mt-10 space-y-10">
          <!-- WHAT'S WORKING -->
          <InsightBlock title="What’s working" tone="positive" :items="insights.working" />

          <!-- WHAT'S RISKY -->
          <InsightBlock title="What’s risky" tone="negative" :items="insights.risky" />

          <!-- HOW TO PROCEED -->
          <InsightBlock title="How to proceed" tone="neutral" :items="insights.proceed" />
        </section>

        <section v-if="!loadingInsights && !insightsError && insightsLocked" class="mt-10 rounded-xl border p-6">
          <h2 class="text-lg font-semibold">Insights are locked</h2>
          <p class="mt-2 text-sm text-gray-600">
            Create an account to unlock your full What’s working, What’s risky, and How to proceed insights.
          </p>
          <NuxtLink
            :to="{
              path: '/signup-login',
              query: {
                signup_source: 'score_wall',
                quiz_id: quizId
              }
            }"
            class="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign up to unlock insights
          </NuxtLink>
        </section>

        <div v-if="loadingInsights" class="mt-6 text-base text-gray-500">Loading insights…</div>

        <div v-if="insightsError" class="mt-6 text-base text-red-600">
          {{ insightsError }}
        </div>

        <!-- Footer -->
        <p class="mb-8 text-xs text-gray-500">Results are locked to preserve objectivity.</p>

        <!-- Actions -->
        <div class="flex items-center gap-6">
          <button
            class="rounded-md bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700"
            @click="startNewRevision"
          >
            Start new revision
          </button>

          <NuxtLink
            to="/quiz/overview"
            class="inline-flex items-center justify-center rounded-lg bg-[#E5E4E2] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#DAD8D4]"
          >
            Back to Overview
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
