<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import Button from '~/components/ui/Button.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  // Lightweight per-session cache for overview side-panels by quiz.
  const overviewCache = new Map()

  const router = useRouter()
  const quizStore = useQuizSessionStore()
  const quizzes = computed(() => quizStore.quizzes)
  const renaming = ref(false)
  const nameDraft = ref('')
  const interviewSummary = ref({
    total: 0,
    completed: 0,
    inProgress: 0
  })
  const isMounted = ref(false)

  const currentQuiz = computed(() => quizzes.value.find((q) => q.id === quizStore.quizId))

  // 📝 checkpoint → hasNotes
  const checkpointHasNotes = ref({})

  const scoreError = ref('')
  const historyEntries = computed(() => {
    if (!currentQuiz.value) return []

    const rootId = currentQuiz.value.parent_quiz_id || currentQuiz.value.id
    return quizzes.value
      .filter((q) => (q.parent_quiz_id || q.id) === rootId && q.status === 'COMPLETED')
      .sort((a, b) => Number(a.revision_number ?? 0) - Number(b.revision_number ?? 0))
  })
  const canViewHistory = computed(() => historyEntries.value.length > 0)

  function latestQuizIdForIdeaRoot(rootId) {
    if (!rootId) return null

    const family = quizzes.value.filter((q) => String(q.parent_quiz_id || q.id) === String(rootId))
    if (!family.length) return null

    const latest = family.reduce((best, q) => {
      return Number(q.revision_number ?? 0) > Number(best.revision_number ?? 0) ? q : best
    }, family[0])

    return latest?.id || null
  }

  async function loadOverviewSideData(quizId, { force = false } = {}) {
    if (!quizId) return

    const cached = overviewCache.get(String(quizId))
    if (cached && !force) {
      checkpointHasNotes.value = { ...cached.checkpointHasNotes }
      interviewSummary.value = { ...cached.interviewSummary }
      return
    }

    const [notesRes, interviewRes] = await Promise.all([
      $fetch('/api/quiz/notes/summary', {
        query: { quiz_id: quizId }
      }),
      $fetch('/api/interview/summary', {
        query: { quiz_id: quizId }
      })
    ])

    const nextCheckpointHasNotes = {}
    for (const cp of notesRes.checkpoints || []) {
      nextCheckpointHasNotes[cp] = true
    }

    checkpointHasNotes.value = nextCheckpointHasNotes
    interviewSummary.value = interviewRes

    overviewCache.set(String(quizId), {
      checkpointHasNotes: nextCheckpointHasNotes,
      interviewSummary: interviewRes
    })
  }

  watch(
    () => quizStore.quizId,
    async (nextQuizId, prevQuizId) => {
      if (!nextQuizId || String(nextQuizId) === String(prevQuizId || '')) return

      // Prevent stale badges/panels while switching ideas.
      checkpointHasNotes.value = {}
      interviewSummary.value = {
        total: 0,
        completed: 0,
        inProgress: 0
      }
      scoreError.value = ''

      await quizStore.loadOverview(nextQuizId)
      await loadOverviewSideData(nextQuizId)
    }
  )

  async function handleScoreClick() {
    try {
      await $fetch('/api/quiz/score/score', {
        method: 'POST',
        body: { quiz_id: quizStore.quizId }
      })

      router.push(`/quiz/score?quiz_id=${quizStore.quizId}`)
    } catch (e) {
      scoreError.value = e.statusMessage || 'Unable to score'
    }
  }

  onMounted(async () => {
    isMounted.value = true
    quizStore.hydrate()
    await loadQuizzes()

    const availableQuizIds = new Set(quizzes.value.map((q) => String(q.id)))

    if (quizStore.quizId && !availableQuizIds.has(String(quizStore.quizId))) {
      quizStore.quizId = null
      quizStore.loaded = false
      if (import.meta.client) {
        localStorage.removeItem('quiz_id')
      }
    }

    if (!quizStore.quizId && quizzes.value.length) {
      quizStore.setQuizId(quizzes.value[0].id)
    }

    // Always resolve overview to latest revision in the selected idea family.
    if (quizStore.quizId) {
      const selected = quizzes.value.find((q) => String(q.id) === String(quizStore.quizId))
      const rootId = selected ? selected.parent_quiz_id || selected.id : quizStore.quizId
      const latestId = latestQuizIdForIdeaRoot(rootId)
      if (latestId && String(latestId) !== String(quizStore.quizId)) {
        quizStore.setQuizId(latestId)
      }
    }

    // 1️⃣ Ensure quiz exists (or recover if session/store is stale)
    if (!quizStore.quizId) {
      const res = await $fetch('/api/quiz/lifecycle/start', { method: 'POST' })
      quizStore.startFreshQuiz(res.quiz_id)
      await loadQuizzes()
    }

    try {
      await quizStore.loadOverview(quizStore.quizId)
    } catch {
      const res = await $fetch('/api/quiz/lifecycle/start', { method: 'POST' })
      quizStore.startFreshQuiz(res.quiz_id)
      await loadQuizzes()
      await quizStore.loadOverview(quizStore.quizId)
    }

    await loadOverviewSideData(quizStore.quizId)
  })

  async function goToCheckpoint(checkpointNumber) {
    await $fetch('/api/quiz/checkpoints/set-current-checkpoint', {
      method: 'POST',
      body: {
        quiz_id: quizStore.quizId,
        checkpoint: checkpointNumber
      }
    })

    router.push(`/quiz/${checkpointNumber}`)
  }

  async function loadQuizzes() {
    await quizStore.loadQuizzes()
  }

  async function saveRename() {
    if (!currentQuiz.value) return

    await $fetch('/api/quiz/rename-quiz', {
      method: 'POST',
      body: {
        quiz_id: currentQuiz.value.id,
        name: nameDraft.value
      }
    })

    quizStore.renameQuiz(currentQuiz.value.id, nameDraft.value)
    currentQuiz.value.name = nameDraft.value
    renaming.value = false
  }

  function openHistory() {
    if (!currentQuiz.value || !canViewHistory.value) return
    router.push(`/quiz/history?quiz_id=${currentQuiz.value.id}`)
  }
</script>

<template>
  <main class="px-6 py-6">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-2 text-2xl font-semibold">Quiz overview</h1>

      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <div class="mb-6 flex items-start justify-between gap-3">
        <div v-if="currentQuiz" class="group min-w-0">
          <div
            v-if="!renaming"
            class="flex cursor-pointer items-center gap-2"
            @click="
              () => {
                renaming = true
                nameDraft = currentQuiz.name
              }
            "
          >
            <h2 class="truncate text-xl font-semibold md:text-2xl">
              {{ currentQuiz.name || 'New idea' }}
              <span v-if="currentQuiz.revision_number > 0" class="text-base text-slate-500">
                — Rev {{ currentQuiz.revision_number }}
              </span>
            </h2>
          </div>

          <div class="mt-1 flex flex-wrap items-center gap-2" v-else>
            <input
              v-model="nameDraft"
              class="w-full rounded border px-2 py-2 text-sm md:w-auto"
              placeholder="Quiz name"
            />
            <button
              @click="saveRename"
              class="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
            >
              Save
            </button>
            <button @click="renaming = false" class="text-sm text-gray-500">Cancel</button>
          </div>
        </div>

        <button
          class="shrink-0 rounded-lg bg-[#E5E4E2] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#DAD8D4] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canViewHistory"
          @click="openHistory"
        >
          🕘 History
        </button>
      </div>

      <!-- Deterministic Interview Section -->
      <section
        v-if="isMounted && quizStore.quizId"
        class="mb-10 rounded-lg border border-neutral-200 bg-gray-50 p-6"
      >
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <!-- Left Content -->
          <div class="flex-1">
            <div class="text-xs font-medium uppercase text-neutral-500">
              Deterministic Validation
            </div>

            <h2 class="mt-2 text-lg font-semibold text-neutral-900">Resolve Uncertainties</h2>

            <div class="mt-3 max-w-md text-sm text-neutral-600">
              Reduce risk by systematically resolving specific unknowns.
            </div>

            <div v-if="interviewSummary.total > 0" class="mt-4 space-y-1 text-sm text-neutral-700">
              <div class="font-medium">Interviews</div>
              <div>{{ interviewSummary.total }} total</div>
              <div>• {{ interviewSummary.completed }} completed</div>
              <div>• {{ interviewSummary.inProgress }} in progress</div>
            </div>

            <div v-else class="mt-4 text-sm text-neutral-600">No uncertainties resolved yet.</div>
          </div>
        </div>
      </section>

      <!-- Checkpoints list -->
      <section v-if="isMounted && quizStore.checkpoints.length" class="space-y-4">
        <div
          v-for="cp in quizStore.checkpoints"
          :key="cp.checkpoint"
          class="flex items-center justify-between rounded border px-4 py-3"
        >
          <div>
            <div class="flex items-center gap-2 text-base font-medium">
              <span>Checkpoint {{ cp.checkpoint }}</span>

              <!-- 📝 Notes indicator -->
              <span
                v-if="checkpointHasNotes[cp.checkpoint]"
                class="inline-flex select-none items-center rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                title="This checkpoint has notes"
              >
                has notes
              </span>
            </div>

            <div class="text-xs text-gray-600">
              <span v-if="cp.unanswered > 0"> {{ cp.unanswered }} unanswered </span>
              <span v-else> All questions answered </span>
            </div>
          </div>

          <button
            class="text-base text-emerald-700 hover:underline"
            @click="goToCheckpoint(cp.checkpoint)"
          >
            Review
          </button>
        </div>
      </section>

      <!-- Footer actions -->
      <div class="mt-10 space-y-2">
        <!-- Error message -->
        <div
          v-if="scoreError"
          class="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-700"
        >
          {{ scoreError }}
        </div>

        <div class="flex items-center gap-4">
          <!-- Score button (before completion) -->
          <Button
            v-if="quizStore.checkpoints.length && !quizStore.isCompleted"
            @click="handleScoreClick()"
          >
            Score My Idea
          </Button>

          <!-- View Score button (after completion) -->
          <NuxtLink
            v-else-if="quizStore.isCompleted"
            :to="`/quiz/score?quiz_id=${quizStore.quizId}`"
            class="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            View Score
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
