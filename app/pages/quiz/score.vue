<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Info } from 'lucide-vue-next'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import ScoreCircle from '~/components/ui/ScoreCircle.vue'
  import InsightBlock from '~/components/score/InsightBlock.vue'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'
  import { useHelpContent } from '~/composables/useHelpContent'
  import { CHECKPOINT_NAMES } from '~/utils/checkpoint-names'

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
  const quizMeta = ref(null)

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
  const showHelpDrawer = ref(false)
  const help = useHelpContent('score')

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

      // ✅ 2️⃣ Fetch quiz meta for heading
      try {
        quizMeta.value = await $fetch('/api/quiz/by-id', {
          query: { quiz_id: quizId }
        })
      } catch {
        quizMeta.value = null
      }

      // ✅ 3️⃣ Fetch revision diff (safe even for original quiz)
      const diffRes = await $fetch('/api/quiz/revision/revision-diff', {
        query: { quiz_id: quizId }
      })

      revisionDiff.value = diffRes.changes || []

      // ✅ 4️⃣ Fetch insights (STEP 4)
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
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">
      <div class="mb-5">
        <h1 class="flex items-center gap-2 text-2xl font-semibold text-app-text">
          <span>Score</span>
          <Info
            class="h-5 w-10 cursor-pointer text-app-muted hover:text-app-muted"
            @click="showHelpDrawer = true"
          />
        </h1>
      </div>

      <!-- Loading -->
      <p v-if="loading" class="text-base text-app-muted">Loading your results…</p>

      <!-- Error -->
      <div v-else-if="error" class="text-base text-red-500">
        Something went wrong while loading the score.
      </div>

      <!-- ✅ SAFE RENDER (score exists) -->
      <div v-else-if="ready">
        <!-- Idea heading -->
        <h2 class="mb-20 truncate text-xl font-semibold md:text-2xl">
          {{ quizMeta?.name || 'New idea' }}
          <span v-if="Number(quizMeta?.revision_number ?? 0) > 0" class="text-base text-app-muted">
            — Rev {{ quizMeta.revision_number }}
          </span>
        </h2>

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

        <p class="mb-8 text-base text-app-muted">Based on your answers across all checkpoints.</p>

        <!-- Market Breakdown -->
        <section class="mb-10">
          <h2 class="mb-3 text-base font-medium">Market breakdown</h2>

          <ul class="space-y-2 text-base">
            <li
              v-for="(value, checkpoint) in result.summary.market_breakdown"
              :key="checkpoint"
              class="flex justify-between rounded border px-4 py-2"
            >
              <span> {{ checkpoint }}) {{ CHECKPOINT_NAMES[checkpoint] }} </span>
              <span class="text-app-muted">{{ value }}</span>
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
              <span class="text-app-muted">{{ value }}</span>
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
            <p class="mb-1 text-xs text-app-muted">
              Checkpoint {{ change.checkpoint }}) {{ CHECKPOINT_NAMES[change.checkpoint] }}
            </p>

            <!-- Question -->
            <p class="mb-3 text-base font-medium">
              {{ change.question_text }}
            </p>

            <!-- Main option -->
            <div v-if="change.main_option.previous !== change.main_option.current" class="mb-3">
              <p class="mb-1 text-xs font-medium text-app-muted">Option</p>

              <div class="grid grid-cols-2 gap-6 text-base">
                <!-- Previous -->
                <div class="text-app-muted">
                  {{ change.main_option.previous ?? '—' }}
                </div>

                <!-- Current -->
                <div class="font-medium text-app-text">
                  {{ change.main_option.current ?? '—' }}
                </div>
              </div>
            </div>

            <!-- ASQs -->
            <div v-if="change.asqs.previous.length || change.asqs.current.length" class="mb-4">
              <p class="mb-1 text-xs font-medium text-app-muted">Follow-up answers</p>

              <ul class="space-y-3">
                <li v-for="(prev, i) in change.asqs.previous" :key="i">
                  <p class="mb-1 text-xs text-app-muted">
                    {{ prev.text }}
                  </p>

                  <div class="grid grid-cols-2 gap-6 text-xs">
                    <!-- Previous -->
                    <div class="text-app-muted">
                      {{ prev.value ?? '—' }}
                    </div>

                    <!-- Current -->
                    <div class="font-medium text-app-text">
                      {{ change.asqs.current[i]?.value ?? '—' }}
                    </div>
                  </div>
                </li>

                <!-- Newly added ASQs (no previous) -->
                <li
                  v-for="(curr, i) in change.asqs.current.slice(change.asqs.previous.length)"
                  :key="'new-' + i"
                >
                  <p class="mb-1 text-xs text-app-muted">
                    {{ curr.text }}
                  </p>

                  <div class="grid grid-cols-2 gap-6 text-xs">
                    <div class="text-app-muted">—</div>
                    <div class="font-medium text-app-text">
                      {{ curr.value }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Notes -->
            <div
              v-if="
                (change.notes?.previous?.length || 0) > 0 ||
                (change.notes?.current?.length || 0) > 0
              "
              class="mb-2"
            >
              <p class="text-md mb-1 font-medium text-app-muted">Notes</p>

              <div class="text-md grid grid-cols-2 gap-6">
                <!-- Previous -->
                <div class="whitespace-pre-wrap text-app-muted">
                  {{ change.notes?.previous?.join('; ') || '—' }}
                </div>

                <!-- Current -->
                <div class="whitespace-pre-wrap font-medium text-app-text">
                  {{ change.notes?.current?.join('; ') || '—' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!--
        <template>
          <section v-if="!loadingInsights && !insightsError && !insightsLocked" class="mt-10 space-y-10">
            <InsightBlock title="What’s working" tone="positive" :items="insights.working" />
            <InsightBlock title="What’s risky" tone="negative" :items="insights.risky" />
            <InsightBlock title="How to proceed" tone="neutral" :items="insights.proceed" />
          </section>


        <section
          v-if="!loadingInsights && !insightsError && insightsLocked"
          class="mt-10 rounded-xl border p-6"
        >
          <h2 class="text-lg font-semibold">Insights are locked</h2>
          <p class="mt-2 text-sm text-app-muted">
            Create an account to unlock your full What’s working, What’s risky, and How to proceed
            insights.
          </p>
          <NuxtLink
            :to="{
              path: '/general/signup-login',
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

        <div v-if="loadingInsights" class="mt-6 text-base text-app-muted">Loading insights…</div>

        <div v-if="insightsError" class="mt-6 text-base text-red-500">
          {{ insightsError }}
        </div>
        </template>
        -->

        <!-- Footer -->
        <p class="mb-8 text-xs text-app-muted">Results are locked to preserve objectivity.</p>

        <!-- Actions -->
        <div class="flex items-center gap-6">
          <NuxtLink
            :to="`/quiz/history?quiz_id=${quizId}`"
            class="inline-flex items-center justify-center rounded-lg bg-[#E5E4E2] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#DAD8D4]"
          >
            Back to History
          </NuxtLink>
        </div>
      </div>
    </div>
    <HelpDrawer :open="showHelpDrawer" :content="help" @close="showHelpDrawer = false" />
  </main>
</template>
