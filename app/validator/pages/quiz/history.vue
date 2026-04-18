<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import ScoreComparison from '../../components/history/ScoreComparison.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  const quizzes = ref([])
  const loading = ref(true)
  const startingRevision = ref(false)
  const comparisonScores = ref({})
  const revisionDiffs = ref({})

  const requestedQuizId = computed(() => String(route.query.quiz_id || quizStore.quizId || ''))

  const selectedQuiz = computed(
    () => quizzes.value.find((q) => String(q.id) === requestedQuizId.value) || null
  )
  const rootQuizId = computed(() =>
    selectedQuiz.value ? String(selectedQuiz.value.parent_quiz_id || selectedQuiz.value.id) : ''
  )

  const historyEntries = computed(() => {
    if (!rootQuizId.value) return []
    return quizzes.value
      .filter(
        (q) => String(q.parent_quiz_id || q.id) === rootQuizId.value && q.status === 'COMPLETED'
      )
      .sort((a, b) => Number(a.revision_number ?? 0) - Number(b.revision_number ?? 0))
  })
  const latestThreeEntries = computed(() =>
    historyEntries.value
      .slice(-3)
      .sort((a, b) => Number(b.revision_number ?? 0) - Number(a.revision_number ?? 0))
  )

  const ideaName = computed(() => {
    if (!rootQuizId.value) return 'Idea'
    const root = quizzes.value.find((q) => String(q.id) === rootQuizId.value)
    return root?.name || selectedQuiz.value?.name || 'Idea'
  })
  const latestCompletedRevision = computed(() => {
    if (!historyEntries.value.length) return null
    return historyEntries.value[historyEntries.value.length - 1]
  })
  const displayedHistoryEntries = computed(() =>
    [...historyEntries.value].sort(
      (a, b) => Number(b.revision_number ?? 0) - Number(a.revision_number ?? 0)
    )
  )

  function entryLabel(entry) {
    return Number(entry.revision_number ?? 0) === 0
      ? `${entry.name || 'New idea'} (Original)`
      : `${entry.name || 'New idea'} — Revision ${entry.revision_number}`
  }

  function versionLabel(entry, index) {
    const base = `Version ${entry.revision_number}`
    return index === 0 ? `${base} (Latest)` : base
  }

  function scoreFor(entry, key) {
    const score = comparisonScores.value[String(entry.id)]
    return Number(score?.[key] ?? 0)
  }

  function marketBreakdownValue(entry, checkpointKey) {
    const score = comparisonScores.value[String(entry.id)]
    return Number(score?.summary?.market_breakdown?.[checkpointKey] ?? 0)
  }

  function confidenceBreakdownValue(entry, key) {
    const score = comparisonScores.value[String(entry.id)]
    return Number(score?.summary?.confidence_breakdown?.[key] ?? 0)
  }

  function deltaText(entry, index, key) {
    if (index >= latestThreeEntries.value.length - 1) return ''
    const current = scoreFor(entry, key)
    const previous = scoreFor(latestThreeEntries.value[index + 1], key)
    const delta = current - previous
    if (!delta) return ''
    return delta > 0 ? `(+${delta})` : `(${delta})`
  }

  function marketBreakdownDelta(entry, index, checkpointKey) {
    if (index >= latestThreeEntries.value.length - 1) return ''
    const current = marketBreakdownValue(entry, checkpointKey)
    const previous = marketBreakdownValue(latestThreeEntries.value[index + 1], checkpointKey)
    const delta = current - previous
    if (!delta) return ''
    return delta > 0 ? `(+${delta})` : `(${delta})`
  }

  function confidenceBreakdownDelta(entry, index, key) {
    if (index >= latestThreeEntries.value.length - 1) return ''
    const current = confidenceBreakdownValue(entry, key)
    const previous = confidenceBreakdownValue(latestThreeEntries.value[index + 1], key)
    const delta = current - previous
    if (!delta) return ''
    return delta > 0 ? `(+${delta})` : `(${delta})`
  }

  const marketBreakdownKeys = computed(() => {
    const keys = new Set()
    for (const entry of latestThreeEntries.value) {
      const score = comparisonScores.value[String(entry.id)]
      const breakdown = score?.summary?.market_breakdown || {}
      for (const key of Object.keys(breakdown)) {
        keys.add(String(key))
      }
    }
    return Array.from(keys).sort((a, b) => Number(a) - Number(b))
  })

  const confidenceBreakdownKeys = computed(() => {
    const keys = new Set()
    for (const entry of latestThreeEntries.value) {
      const score = comparisonScores.value[String(entry.id)]
      const breakdown = score?.summary?.confidence_breakdown || {}
      for (const key of Object.keys(breakdown)) {
        keys.add(String(key))
      }
    }
    return Array.from(keys)
  })

  async function loadHistory() {
    loading.value = true
    quizStore.hydrate()
    await quizStore.loadQuizzes()
    quizzes.value = [...quizStore.quizzes]
    loading.value = false
  }

  async function loadComparisonScores() {
    const entries = latestThreeEntries.value
    if (!entries.length) {
      comparisonScores.value = {}
      return
    }

    const scorePairs = await Promise.all(
      entries.map(async (entry) => {
        try {
          const score = await $fetch('/api/quiz/lifecycle/result', {
            query: { quiz_id: entry.id }
          })
          return [String(entry.id), score]
        } catch {
          return [String(entry.id), null]
        }
      })
    )

    comparisonScores.value = Object.fromEntries(scorePairs)
  }

  async function loadRevisionDiffs() {
    const entries = latestThreeEntries.value
    if (!entries.length) {
      revisionDiffs.value = {}
      return
    }

    const diffPairs = await Promise.all(
      entries.map(async (entry) => {
        try {
          const diff = await $fetch('/api/quiz/revision/revision-diff', {
            query: { quiz_id: entry.id }
          })
          return [String(entry.id), diff?.changes || []]
        } catch {
          return [String(entry.id), []]
        }
      })
    )

    revisionDiffs.value = Object.fromEntries(diffPairs)
  }

  function optionChangeLabel(change) {
    const prev = change?.main_option?.previous ?? '—'
    const curr = change?.main_option?.current ?? '—'
    if (prev === curr) return ''
    return `${prev} -> ${curr}`
  }

  function changesForEntry(entry) {
    return revisionDiffs.value[String(entry.id)] || []
  }

  function goToScore(entry) {
    router.push(`/quiz/score?quiz_id=${entry.id}`)
  }

  async function startNewRevision() {
    if (!latestCompletedRevision.value || startingRevision.value) return
    startingRevision.value = true

    try {
      await quizStore.startRevision(latestCompletedRevision.value.id)
    } finally {
      startingRevision.value = false
    }
  }

  onMounted(async () => {
    await loadHistory()
  })

  watch(
    () => latestThreeEntries.value.map((e) => e.id).join(','),
    async () => {
      await loadComparisonScores()
      await loadRevisionDiffs()
    },
    { immediate: true }
  )
</script>

<template>
  <main class="min-h-screen bg-white px-4 py-5 md:px-6 md:py-6">
    <!-- HEADER -->
    <div class="mx-auto max-w-2xl">
      <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-slate-900 sm:text-3xl">History</h1>

          <p class="mt-1 truncate text-sm text-slate-600">
            {{ ideaName }}
          </p>
        </div>

        <!-- Optional actions -->
        <div class="flex gap-2">
          <button
            class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!latestCompletedRevision || startingRevision"
            @click="startNewRevision"
          >
            {{ startingRevision ? 'Starting...' : 'New Revision' }}
          </button>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="mx-auto max-w-2xl">
      <div class="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Loading history...
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="!historyEntries.length" class="mx-auto max-w-2xl">
      <div class="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p class="text-sm text-slate-600">No completed score pages yet.</p>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div v-else class="space-y-6">
      <!-- SCORE COMPARISON -->
      <div class="mx-auto max-w-2xl">
        <h2 class="mb-3 text-2xl font-semibold text-slate-900">
          Score comparison
        </h2>
        <ScoreComparison
          :latestThreeEntries="latestThreeEntries"
          :marketBreakdownKeys="marketBreakdownKeys"
          :confidenceBreakdownKeys="confidenceBreakdownKeys"
          :versionLabel="versionLabel"
          :scoreFor="scoreFor"
          :deltaText="deltaText"
          :marketBreakdownValue="marketBreakdownValue"
          :marketBreakdownDelta="marketBreakdownDelta"
          :confidenceBreakdownValue="confidenceBreakdownValue"
          :confidenceBreakdownDelta="confidenceBreakdownDelta"
        />
      </div>

      <!-- WHAT CHANGED -->
      <section v-if="latestThreeEntries.length" class="mx-auto mt-10 max-w-2xl border-t pt-6 sm:mt-12 sm:pt-8">
        <h2 class="mb-4 text-2xl font-semibold text-slate-900">
          What changed
        </h2>

        <div class="space-y-4">
          <div
            v-for="(entry, entryIndex) in latestThreeEntries"
            :key="`change-entry-${entry.id}`"
            class="rounded-md border border-slate-200 bg-white p-3 sm:p-4"
          >
            <div class="mb-3 text-base font-semibold text-slate-900">
              {{ versionLabel(entry, entryIndex) }}
            </div>

            <p v-if="Number(entry.revision_number ?? 0) === 0" class="text-sm text-slate-500">
              Original version. No previous revision to compare.
            </p>

            <p v-else-if="!changesForEntry(entry).length" class="text-sm text-slate-500">
              No answer/note changes detected versus previous revision.
            </p>

            <div
              v-for="change in changesForEntry(entry)"
              :key="`${entry.id}-${change.question_id}`"
              class="mb-4 rounded-md border border-slate-200 bg-white p-3"
            >
              <!-- Checkpoint -->
              <p class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                Checkpoint {{ change.checkpoint }}
              </p>

              <!-- Question -->
              <p class="mb-3 text-sm font-medium text-slate-900 sm:text-base">
                {{ change.question_text }}
              </p>

              <!-- OPTION -->
              <div v-if="change.main_option.previous !== change.main_option.current" class="mb-3">
                <p class="mb-1 text-[11px] font-medium uppercase text-slate-500">Option</p>

                <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                  <span class="truncate text-left text-slate-400 line-through">
                    {{ change.main_option.previous ?? '—' }}
                  </span>

                  <span class="text-2xl font-bold leading-none text-black">→</span>

                  <span class="truncate text-right font-semibold text-slate-900">
                    {{ change.main_option.current ?? '—' }}
                  </span>
                </div>
              </div>

              <!-- ASQs -->
              <div v-if="change.asqs.previous.length || change.asqs.current.length" class="mb-4">
                <p class="mb-1 text-[11px] font-medium uppercase text-slate-500">Follow-up answers</p>

                <ul class="space-y-3">
                  <li v-for="(prev, i) in change.asqs.previous" :key="i">
                    <p class="mb-1 text-[11px] text-slate-400">
                      {{ prev.text }}
                    </p>

                    <div class="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2 sm:gap-6">
                      <div class="text-slate-400">
                        {{ prev.value ?? '—' }}
                      </div>

                      <div class="font-medium text-slate-900">
                        {{ change.asqs.current[i]?.value ?? '—' }}
                      </div>
                    </div>
                  </li>

                  <!-- New ASQs -->
                  <li
                    v-for="(curr, i) in change.asqs.current.slice(change.asqs.previous.length)"
                    :key="'new-' + i"
                  >
                    <p class="mb-1 text-[11px] text-slate-400">
                      {{ curr.text }}
                    </p>

                    <div class="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2 sm:gap-6">
                      <div class="text-slate-400">—</div>
                      <div class="font-medium text-slate-900">
                        {{ curr.value }}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- NOTES -->
              <div v-if="change.notes.previous.length || change.notes.current.length">
                <div class="mt-2 rounded-md border-l-4 border-l-emerald-500 border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <div class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Note
                  </div>
                  <div class="whitespace-pre-wrap text-sm italic text-emerald-900">
                    {{ change.notes.current.join('; ') || '—' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HISTORY LIST -->
      <div class="mx-auto max-w-2xl">
        <h2 class="mb-3 text-2xl font-semibold text-slate-900">
          All Revisions
        </h2>
        <div class="space-y-2">
          <button
            v-for="entry in displayedHistoryEntries"
            :key="entry.id"
            class="group w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-indigo-300 active:scale-[0.98]"
            @click="goToScore(entry)"
          >
            <div class="flex items-center justify-between">
              <div class="text-base font-medium text-slate-900">
                {{ entryLabel(entry) }}
              </div>

              <div class="text-xs text-slate-400 group-hover:text-indigo-500">→</div>
            </div>

            <div class="mt-1 text-xs text-slate-500">Open score page</div>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
