<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { Info } from 'lucide-vue-next'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import Button from '~/components/ui/Button.vue'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'
  import TopAlert from '~/components/ui/TopAlert.vue'
  import { useHelpContent } from '~/composables/useHelpContent'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const checkpointNames = {
    1: 'Problem Strength',
    2: 'Buying Urgency',
    3: 'Monetization Potential',
    4: 'ICP Clarity',
    5: 'Competitive Positioning',
    6: 'Distribution Channels',
    7: 'Founder-Market Fit',
    8: 'Execution Capacity',
    9: 'Founder Conviction'
  }

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
  const showHelpDrawer = ref(false)
  const showRevisionLimitAlert = ref(false)
  const help = useHelpContent('overview')

  const currentQuiz = computed(() =>
    quizzes.value.find((q) => String(q.id) === String(quizStore.quizId))
  )

  // 📝 checkpoint → hasNotes
  const checkpointHasNotes = ref({})

  const scoreError = ref('')
  function syncWorkspaceFromQuizId(quizId) {
    const selected = quizzes.value.find((q) => String(q.id) === String(quizId))
    if (selected?.workspace_id) {
      quizStore.setCurrentWorkspace({ id: selected.workspace_id })
    }
  }

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

  async function ensureActiveRevisionForSelectedFamily() {
    if (!quizStore.quizId) return

    const selected = quizzes.value.find((q) => String(q.id) === String(quizStore.quizId))
    if (!selected) return

    const rootId = selected.parent_quiz_id || selected.id
    const family = quizzes.value.filter((q) => String(q.parent_quiz_id || q.id) === String(rootId))
    if (!family.length) return

    const latest = family.reduce((best, q) => {
      return Number(q.revision_number ?? 0) > Number(best.revision_number ?? 0) ? q : best
    }, family[0])

    // Auto-create next revision only when latest scored revision is completed
    // and no active in-progress quiz exists in the same idea family.
    const hasInProgress = family.some((q) => String(q.status) === 'IN_PROGRESS')
    const shouldAutoCreate = !hasInProgress && String(latest.status) === 'COMPLETED'

    if (!shouldAutoCreate) return

    let res
    try {
      res = await $fetch('/api/quiz/revision/create-revision', {
        method: 'POST',
        body: { quiz_id: latest.id }
      })
    } catch (error) {
      const statusCode = Number(error?.statusCode || error?.data?.statusCode || 0)
      const statusMessage = String(error?.statusMessage || error?.data?.statusMessage || '')
      if (statusCode === 403 && statusMessage.includes('Revisions limit reached')) {
        showRevisionLimitAlert.value = true
        return
      }
      throw error
    }

    quizStore.startFreshQuiz(res.quiz_id)
    await loadQuizzes()
    syncWorkspaceFromQuizId(res.quiz_id)
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
      scoreError.value =
        e?.data?.statusMessage ||
        e?.data?.message ||
        e?.statusMessage ||
        e?.message ||
        'Unable to score'
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
      quizStore.setCurrentWorkspace(null)
      if (import.meta.client) {
        localStorage.removeItem('quiz_id')
      }
    }

    if (!quizStore.quizId && quizzes.value.length) {
      quizStore.setQuizId(quizzes.value[0].id)
    }

    if (quizStore.quizId) {
      syncWorkspaceFromQuizId(quizStore.quizId)
    } else if (quizzes.value.length && !quizStore.currentWorkspaceId) {
      const firstWorkspaceId = quizzes.value[0]?.workspace_id || null
      if (firstWorkspaceId) {
        quizStore.setWorkspaceId(firstWorkspaceId)
      }
    }

    // Always resolve overview to latest revision in the selected idea family.
    if (quizStore.quizId) {
      const selected = quizzes.value.find((q) => String(q.id) === String(quizStore.quizId))
      const rootId = selected ? selected.parent_quiz_id || selected.id : quizStore.quizId
      const latestId = latestQuizIdForIdeaRoot(rootId)
      if (latestId && String(latestId) !== String(quizStore.quizId)) {
        quizStore.setQuizId(latestId)
        syncWorkspaceFromQuizId(latestId)
      }
    }

    await ensureActiveRevisionForSelectedFamily()

    // 1️⃣ Ensure quiz exists (or recover if session/store is stale)
    if (!quizStore.quizId) {
      const workspace = await $fetch('/api/workspace/create', {
        method: 'POST'
      })

      const res = await $fetch('/api/quiz/lifecycle/start?force=true', {
        method: 'POST',
        body: {
          workspace_id: workspace.workspace_id
        }
      })

      quizStore.startFreshQuiz(res.quiz_id)

      await loadQuizzes()
      syncWorkspaceFromQuizId(res.quiz_id)
    }

    try {
      await quizStore.loadOverview(quizStore.quizId)
    } catch {
      const workspace = await $fetch('/api/workspace/create', {
        method: 'POST'
      })

      const res = await $fetch('/api/quiz/lifecycle/start?force=true', {
        method: 'POST',
        body: {
          workspace_id: workspace.workspace_id
        }
      })

      quizStore.startFreshQuiz(res.quiz_id)

      await loadQuizzes()
      syncWorkspaceFromQuizId(res.quiz_id)

      await quizStore.loadOverview(quizStore.quizId)
    }

    await loadOverviewSideData(quizStore.quizId)
  })

  function goToCheckpoint(checkpointNumber) {
    // Optimistic navigation: switch screen immediately, sync checkpoint in background.
    router.push(`/quiz/${checkpointNumber}`)

    $fetch('/api/quiz/checkpoints/set-current-checkpoint', {
      method: 'POST',
      body: {
        quiz_id: quizStore.quizId,
        checkpoint: checkpointNumber
      }
    }).catch((err) => {
      console.error('Failed to persist current checkpoint:', err)
    })
  }

  async function loadQuizzes() {
    await quizStore.loadQuizzes()
  }

  async function saveRename() {
    if (!currentQuiz.value) return
    const trimmed = nameDraft.value.trim()
    if (!trimmed) return

    await $fetch('/api/quiz/rename-quiz', {
      method: 'POST',
      body: {
        quiz_id: currentQuiz.value.id,
        name: trimmed
      }
    })

    quizStore.renameQuiz(currentQuiz.value.id, trimmed)
    currentQuiz.value.name = trimmed
    renaming.value = false
  }

  function openHistory() {
    if (!currentQuiz.value || !canViewHistory.value) return
    router.push(`/quiz/history?quiz_id=${currentQuiz.value.id}`)
  }
</script>

<template>
  <main class="px-6 py-6">
    <TopAlert
      :open="showRevisionLimitAlert"
      title="Revision limit reached"
      variant="warning"
      message="Upgrade your plan to create another revision for this idea."
      @close="showRevisionLimitAlert = false"
    />
    <div class="mx-auto max-w-2xl">
      <div class="mb-6 rounded-lg border border-slate-200 bg-white px-6 py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1
              class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900"
            >
              <span>Overview - Refine your idea</span>

              <Info
                class="h-5 w-5 cursor-pointer text-gray-400 transition hover:text-gray-700"
                @click="showHelpDrawer = true"
              />
            </h1>

            <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
          </div>
        </div>
      </div>
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
      </div>

      <!-- Checkpoints list -->
      <section v-if="isMounted && quizStore.checkpoints.length" class="space-y-4">
        <div
          v-for="cp in quizStore.checkpoints"
          :key="cp.checkpoint"
          class="flex items-center justify-between rounded border border-neutral-300 bg-white px-4 py-3"
        >
          <div>
            <div class="flex items-center gap-2 text-base font-medium">

              <span>
                {{ cp.checkpoint }}) {{ checkpointNames[cp.checkpoint] }}
              </span>

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
          class="mb-4 whitespace-pre-line rounded border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-700"
        >
          {{ scoreError }}
        </div>

        <div class="flex items-center gap-4">
          <!-- History button -->
          <button
            class="rounded bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canViewHistory"
            @click="openHistory"
          >
            🕘 History
          </button>

          <!-- Score button (before completion) -->
          <Button
            v-if="quizStore.checkpoints.length && !quizStore.isCompleted"
            class="rounded border border-emerald-600 bg-white px-6 py-3 !text-black hover:bg-white hover:!text-black"
            @click="handleScoreClick()"
          >
            Score My Idea
          </Button>

          <!-- View Score button (after completion) -->
          <NuxtLink
            v-else-if="quizStore.isCompleted"
            :to="`/quiz/score?quiz_id=${quizStore.quizId}`"
            class="rounded border border-emerald-600 bg-white px-6 py-3 text-black hover:bg-white hover:text-black"
          >
            View Score
          </NuxtLink>
        </div>
      </div>
    </div>
    <HelpDrawer :open="showHelpDrawer" :content="help" @close="showHelpDrawer = false" />
  </main>
</template>
