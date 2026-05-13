<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Info } from 'lucide-vue-next'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import InterviewScreenFreeform from '~/components/interview/InterviewScreenFreeform.vue'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'
  import TopAlert from '~/components/ui/TopAlert.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const router = useRouter()
  const route = useRoute()
  const quizStore = useQuizSessionStore()

  const interviews = ref([])
  const quizName = ref('')
  const loading = ref(true)

  const renamingId = ref(null)
  const nameDraft = ref('')
  const cloningInterviewId = ref(null)
  const actionError = ref(null)

  const selectedFilter = ref('all')
  const structuredStatusFilter = ref('all')
  const quickSearchQuery = ref('')
  const showFreeformInterview = ref(false)
  const freeformInterviewId = ref(null)
  const freeformConditionId = ref(null)
  const freeformScreenRef = ref(null)
  const closingFreeform = ref(false)
  const showHelpDrawer = ref(false)
  const showFreeformLimitAlert = ref(false)

  async function loadInterviewData() {
    if (!quizStore.quizId) {
      interviews.value = []
      quizName.value = ''
      return
    }

    const [interviewRows, quiz] = await Promise.all([
      $fetch('/api/interview/list', {
        query: { quiz_id: quizStore.quizId }
      }),
      $fetch('/api/quiz/by-id', {
        query: { quiz_id: quizStore.quizId }
      })
    ])

    interviews.value = interviewRows
    quizName.value = quiz?.name || ''
  }

  async function maybeOpenInterviewFromQuery() {
    const openInterviewId = route.query?.open_interview_id
    if (!openInterviewId) return

    const target = interviews.value.find((interview) => String(interview.id) === String(openInterviewId))
    if (!target) return

    await openQuickInterview(target)

    const nextQuery = { ...route.query }
    delete nextQuery.open_interview_id
    await router.replace({ query: nextQuery })
  }

  onMounted(async () => {
    const quizIdFromQuery = route.query?.quiz_id
    if (quizIdFromQuery && !quizStore.quizId) {
      quizStore.setQuizId(String(quizIdFromQuery))
    }

    if (!quizStore.quizId) {
      loading.value = false
      return
    }

    try {
      await loadInterviewData()
      await maybeOpenInterviewFromQuery()
    } finally {
      loading.value = false
    }
  })

  function openInterview(id) {
    router.push(`/quiz/interview/${id}?quiz_id=${quizStore.quizId}`)
  }

  async function openQuickInterview(interview) {
    if (!interview?.id) return

    actionError.value = null

    try {
      const res = await $fetch('/api/interview/freeform/get', {
        query: { interview_id: interview.id }
      })

      freeformInterviewId.value = interview.id
      freeformConditionId.value = res?.condition_id || res?.evidence?.condition_id || null

      if (!freeformConditionId.value) {
        throw new Error('Missing freeform condition context')
      }

      showFreeformInterview.value = true
    } catch {
      actionError.value = 'Unable to open quick interview.'
    }
  }

  function openFreeformInterview() {
    if (!quizStore.quizId) return
    actionError.value = null
    showFreeformLimitAlert.value = false

    $fetch('/api/interview/freeform/start', {
      method: 'POST',
      body: { quiz_id: quizStore.quizId }
    })
      .then((res) => {
        freeformInterviewId.value = res?.interview_id || null
        freeformConditionId.value = res?.condition_id || null

        if (!freeformInterviewId.value || !freeformConditionId.value) {
          throw new Error('Missing freeform context')
        }

        showFreeformInterview.value = true
      })
      .catch((err) => {
        const statusCode = Number(err?.statusCode || err?.data?.statusCode || 0)
        const statusMessage = String(err?.statusMessage || err?.data?.statusMessage || '')
        if (statusCode === 403 && statusMessage.includes('Freeform interview limit reached')) {
          showFreeformLimitAlert.value = true
          return
        }
        actionError.value =
          err?.data?.statusMessage ||
          err?.statusMessage ||
          err?.message ||
          'Unable to start freeform interview.'
      })
  }

  async function closeFreeformInterview() {
    if (closingFreeform.value) return
    closingFreeform.value = true

    let saveCloseError = null

    try {
      await freeformScreenRef.value?.flushAndSave?.()
    } catch (err) {
      saveCloseError =
        err?.data?.statusMessage ||
        err?.statusMessage ||
        err?.message ||
        'Failed to save quick interview changes while closing.'
    }

    showFreeformInterview.value = false
    freeformInterviewId.value = null
    freeformConditionId.value = null

    if (saveCloseError) {
      actionError.value = `Closed quick interview, but save failed: ${saveCloseError}`
    }

    try {
      await loadInterviewData()
    } catch {
      actionError.value = 'Closed quick interview, but failed to refresh list.'
    }

    closingFreeform.value = false
  }

  function startRename(interview) {
    renamingId.value = interview.id
    nameDraft.value = interview.respondent_info || ''
  }

  async function saveRename(interview) {
    await $fetch('/api/interview/update-respondent', {
      method: 'POST',
      body: {
        interview_id: interview.id,
        respondent_info: nameDraft.value
      }
    })

    interview.respondent_info = nameDraft.value
    renamingId.value = null
  }

  async function interviewAgainFromCard(sourceInterviewId) {
    if (cloningInterviewId.value) return

    cloningInterviewId.value = sourceInterviewId
    actionError.value = null

    try {
      const payload = await $fetch('/api/interview/get', {
        query: { interview_id: sourceInterviewId }
      })

      const quizId = quizStore.quizId || payload?.interview?.quiz_id
      const subUncertaintyId = payload?.sub_uncertainty?.id
      const goalId = payload?.goal?.id

      if (!quizId || !subUncertaintyId || !goalId) {
        throw new Error('Missing interview context')
      }

      await $fetch('/api/sub_uncertainty/update-goal', {
        method: 'POST',
        body: {
          goal_id: goalId,
          statement: payload.goal?.statement || ''
        }
      })

      const conditionsPayload = (payload.conditions || []).map((condition) => ({
        description: condition.description,
        questions: (payload.questions || [])
          .filter((q) => String(q.condition_id) === String(condition.id))
          .map((q) => q.text)
      }))

      await $fetch('/api/sub_uncertainty/replace-conditions', {
        method: 'POST',
        body: {
          goal_id: goalId,
          conditions: conditionsPayload
        }
      })

      const res = await $fetch('/api/interview/start', {
        method: 'POST',
        body: {
          quiz_id: quizId,
          sub_uncertainty_id: subUncertaintyId
        }
      })

      router.push(`/quiz/interview/${res.interview_id}?quiz_id=${quizId}`)
    } catch (err) {
      actionError.value = 'Unable to start another interview from this card.'
    } finally {
      cloningInterviewId.value = null
    }
  }

  function isQuickInterview(interview) {
    return String(interview.sub_uncertainty || '').toUpperCase() === 'FREEFORM'
  }

  const quickInterviews = computed(() => interviews.value.filter((i) => isQuickInterview(i)))

  function quickTagsText(interview) {
    const structured = interview.latest_structured_responses || {}
    return String(structured.tags || '')
  }

  function quickContentText(interview) {
    return String(interview.latest_notes || interview.latest_evidence_log || '')
  }

  const filteredQuickInterviews = computed(() => {
    const q = quickSearchQuery.value.trim().toLowerCase()
    if (!q) return quickInterviews.value

    return quickInterviews.value.filter((interview) => {
      const title = quickTitle(interview).toLowerCase()
      const tags = quickTagsText(interview).toLowerCase()
      const content = quickContentText(interview).toLowerCase()
      return title.includes(q) || tags.includes(q) || content.includes(q)
    })
  })

  const quickPreviewInterviews = computed(() => quickInterviews.value.slice(0, 5))

  const structuredInterviews = computed(() => interviews.value.filter((i) => !isQuickInterview(i)))

  const structuredInterviewsForTab = computed(() => {
    if (structuredStatusFilter.value === 'all') return structuredInterviews.value
    if (structuredStatusFilter.value === 'completed') {
      return structuredInterviews.value.filter((i) => !!i.finished_at)
    }
    if (structuredStatusFilter.value === 'in_progress') {
      return structuredInterviews.value.filter((i) => !i.finished_at)
    }
    return structuredInterviews.value
  })

  function groupStructured(items) {
    const groups = {}

    for (const interview of items) {
      const key = interview.sub_uncertainty_id || 'default'

      if (!groups[key]) {
        groups[key] = {
          subUncertaintyId: key,
          subUncertainty: interview.sub_uncertainty || 'Sub-uncertainty',
          interviews: []
        }
      }

      groups[key].interviews.push(interview)
    }

    return Object.values(groups).map((group) => ({
      ...group,
      interviews: group.interviews.sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
    }))
  }

  const groupedStructuredInterviews = computed(() => groupStructured(structuredInterviews.value))
  const groupedStructuredInterviewsForTab = computed(() =>
    groupStructured(structuredInterviewsForTab.value)
  )

  function formatLocalDateTime(value) {
    if (!value) return ''

    const date = new Date(value)
    if (!Number.isFinite(date.getTime())) return ''

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  function quickTitle(interview) {
    const structured = interview.latest_structured_responses || {}
    return (
      structured.title?.trim() ||
      interview.respondent_info?.trim() ||
      interview.name?.trim() ||
      'Interview'
    )
  }

  function quickSnippet(interview) {
    const raw = (interview.latest_notes || interview.latest_evidence_log || '').trim()
    if (!raw) return 'No notes yet.'
    return raw.length > 90 ? `${raw.slice(0, 90)}...` : raw
  }

  function quickRespondent(interview) {
    return (interview.respondent_info || '').trim() || 'Unknown respondent'
  }
</script>

<template>
  <main class="px-6 py-6">
    <TopAlert
      :open="showFreeformLimitAlert"
      title="Freeform interview limit reached"
      variant="warning"
      message="Upgrade your plan to run more quick interviews for this idea in the current period."
      @close="showFreeformLimitAlert = false"
    />
    <InterviewScreenFreeform
      v-if="showFreeformInterview"
      ref="freeformScreenRef"
      :interview-id="freeformInterviewId"
      :condition-id="freeformConditionId"
    />
    <button
      v-if="showFreeformInterview"
      class="fixed right-4 top-4 z-[60] rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
      :disabled="closingFreeform"
      @click="closeFreeformInterview"
    >
      {{ closingFreeform ? 'Closing...' : 'Close' }}
    </button>

    <div class="mx-auto max-w-2xl">
      <div class="mb-8 space-y-6">
        <!-- Page header -->
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold">
            <span>Interviews</span>
            <Info
              class="h-5 w-10 cursor-pointer text-gray-400 hover:text-gray-700"
              @click="showHelpDrawer = true"
            />
          </h1>
          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="rounded-md px-3 py-2 text-sm font-medium transition"
              :class="
                selectedFilter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              "
              @click="selectedFilter = 'all'"
            >
              All
            </button>

            <button
              class="rounded-md px-3 py-2 text-sm font-medium transition"
              :class="
                selectedFilter === 'quick'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              "
              @click="selectedFilter = 'quick'"
            >
              Quick
            </button>

            <button
              class="rounded-md px-3 py-2 text-sm font-medium transition"
              :class="
                selectedFilter === 'structured'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              "
              @click="selectedFilter = 'structured'"
            >
              Structured
            </button>
          </div>

          <div class="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <NuxtLink
              to="/quiz/overview"
              class="inline-flex flex-1 items-center justify-center rounded-lg bg-[#E5E4E2] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#DAD8D4] md:flex-none"
            >
              Back to Overview
            </NuxtLink>

            <button
              class="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 md:flex-none"
              @click="openFreeformInterview"
            >
              + Quick Interview
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-base text-gray-600">Loading interviews...</div>

      <div v-else>
        <div v-if="actionError" class="mb-4 text-sm text-red-600">
          {{ actionError }}
        </div>

        <!-- Empty State -->
        <div
          v-if="interviews.length === 0"
          class="mb-6 rounded border border-gray-300 bg-gray-50 px-4 py-4 text-base text-gray-700"
        >
          No interviews yet.
        </div>

        <template v-if="interviews.length > 0">
          <!-- ALL TAB DASHBOARD -->
          <template v-if="selectedFilter === 'all'">
            <section class="mb-8">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">
                  Quick Interviews ({{ quickInterviews.length }})
                </h2>
                <button
                  class="text-sm font-medium text-emerald-700 hover:underline"
                  @click="selectedFilter = 'quick'"
                >
                  View all →
                </button>
              </div>

              <div v-if="quickInterviews.length > 0" class="grid gap-3 sm:grid-cols-2">
                <button
                  v-for="interview in quickPreviewInterviews"
                  :key="interview.id"
                  class="rounded-lg border border-neutral-300 bg-white p-4 text-left transition hover:border-neutral-300 hover:bg-neutral-50"
                  @click="openQuickInterview(interview)"
                >
                  <div class="text-base font-semibold text-neutral-900">
                    🧠 {{ quickTitle(interview) }}
                  </div>
                  <div class="mt-1 text-xs text-neutral-500">
                    Respondent: {{ quickRespondent(interview) }}
                  </div>
                  <div class="mt-1 text-sm text-neutral-600">"{{ quickSnippet(interview) }}"</div>
                </button>
              </div>

              <div
                v-else
                class="rounded border border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-700"
              >
                No quick interviews yet.
              </div>
            </section>

            <section>
              <div class="mb-4 flex items-center justify-between gap-3">
                <h2 class="text-lg font-semibold text-gray-900">
                  Structured Interviews ({{ structuredInterviews.length }})
                </h2>
                <NuxtLink
                  to="/quiz/master-detail"
                  class="inline-flex items-center rounded-md border-2 border-emerald-600 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                >
                  Go to Master Detail
                </NuxtLink>
              </div>
              <div
                v-if="groupedStructuredInterviews.length === 0"
                class="rounded border border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-700"
              >
                No structured interviews yet.
              </div>
              <template v-else>
                <div
                  v-for="group in groupedStructuredInterviews"
                  :key="group.subUncertaintyId"
                  class="mb-10"
                >
                  <div class="border-l-4 border-emerald-500 pl-4">
                    <div class="space-y-3">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900">
                          {{ group.subUncertainty }}
                        </h3>
                        <div class="text-xs text-gray-500">
                          {{ group.interviews.length }} interviews
                        </div>
                      </div>

                      <button
                        class="inline-flex w-fit rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        :disabled="!!cloningInterviewId"
                        @click="interviewAgainFromCard(group.interviews[0].id)"
                      >
                        Interview Another Person
                      </button>
                    </div>
                  </div>

                  <div class="mt-4 border-t"></div>

                  <div class="divide-y">
                    <div
                      v-for="interview in group.interviews"
                      :key="interview.id"
                      class="flex items-center justify-between py-4"
                    >
                      <div class="flex-1">
                        <div class="group flex items-center gap-2">
                          <template v-if="renamingId !== interview.id">
                            <div class="font-medium text-gray-900">
                              {{ interview.respondent_info || 'Interview' }}
                            </div>

                            <span
                              class="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                              title="Rename"
                              @click="startRename(interview)"
                            >
                              ✏️
                            </span>
                          </template>

                          <template v-else>
                            <input
                              v-model="nameDraft"
                              class="rounded border border-gray-300 px-2 py-1 text-sm"
                              placeholder="Respondent name, role, company..."
                            />

                            <button class="text-sm text-emerald-700" @click="saveRename(interview)">
                              Save
                            </button>

                            <button class="text-sm text-gray-500" @click="renamingId = null">
                              Cancel
                            </button>
                          </template>
                        </div>

                        <div class="mt-1 text-xs text-gray-500">
                          Started {{ new Date(interview.started_at).toLocaleDateString() }}
                        </div>

                        <div class="mt-1 text-xs font-medium">
                          <span v-if="interview.finished_at" class="text-emerald-700">
                            Completed
                          </span>
                          <span v-else class="text-amber-600"> In Progress </span>
                        </div>
                      </div>

                      <div class="flex items-center gap-4">
                        <button
                          class="text-sm font-medium text-emerald-700 hover:underline"
                          @click="openInterview(interview.id)"
                        >
                          {{ interview.finished_at ? 'View' : 'Resume' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </section>
          </template>

          <!-- QUICK TAB -->
          <section v-else-if="selectedFilter === 'quick'">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">
              Quick Interviews ({{ filteredQuickInterviews.length }})
            </h2>

            <div class="mb-4">
              <input
                v-model="quickSearchQuery"
                type="text"
                placeholder="Search quick interviews by title, tags, or content"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div v-if="filteredQuickInterviews.length > 0" class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="interview in filteredQuickInterviews"
                :key="interview.id"
                class="rounded-lg border border-neutral-300 bg-white p-4 text-left transition hover:border-neutral-300 hover:bg-neutral-50"
                @click="openQuickInterview(interview)"
              >
                <div class="text-base font-semibold text-neutral-900">
                  🧠 {{ quickTitle(interview) }}
                </div>
                <div class="mt-1 text-xs text-neutral-500">
                  Respondent: {{ quickRespondent(interview) }}
                </div>
                <div class="mt-1 text-sm text-neutral-600">"{{ quickSnippet(interview) }}"</div>
              </button>
            </div>

            <div
              v-else
              class="rounded border border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-700"
            >
              No quick interviews yet.
            </div>
          </section>

          <!-- STRUCTURED TAB -->
          <section v-else>
            <div class="mb-4 flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-gray-900">
                Structured Interviews ({{ structuredInterviewsForTab.length }})
              </h2>
              <NuxtLink
                to="/quiz/master-detail"
                class="inline-flex items-center rounded-md border-2 border-emerald-600 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                Go to Master Detail
              </NuxtLink>
            </div>

            <div class="my-5">
              <select
                v-model="structuredStatusFilter"
                class="w-64 rounded border border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>

            <div
              v-if="groupedStructuredInterviewsForTab.length === 0"
              class="rounded border border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-700"
            >
              No structured interviews yet.
            </div>

            <template v-else>
              <div
                v-for="group in groupedStructuredInterviewsForTab"
                :key="group.subUncertaintyId"
                class="mb-10"
              >
                <div class="border-l-4 border-emerald-500 pl-4">
                  <div class="space-y-3">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">
                        {{ group.subUncertainty }}
                      </h3>

                      <div class="text-xs text-gray-500">
                        {{ group.interviews.length }} interviews
                      </div>
                    </div>

                    <button
                      class="inline-flex w-fit rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      :disabled="!!cloningInterviewId"
                      @click="interviewAgainFromCard(group.interviews[0].id)"
                    >
                      Interview Another Person
                    </button>
                  </div>
                </div>

                <div class="mt-4 border-t"></div>

                <div class="divide-y">
                  <div
                    v-for="interview in group.interviews"
                    :key="interview.id"
                    class="flex items-center justify-between py-4"
                  >
                    <div class="flex-1">
                      <div class="group flex items-center gap-2">
                        <template v-if="renamingId !== interview.id">
                          <div class="font-medium text-gray-900">
                            {{ interview.respondent_info || 'Interview' }}
                          </div>

                          <span
                            class="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                            title="Rename"
                            @click="startRename(interview)"
                          >
                            ✏️
                          </span>
                        </template>

                        <template v-else>
                          <input
                            v-model="nameDraft"
                            class="rounded border border-gray-300 px-2 py-1 text-sm"
                            placeholder="Respondent name, role, company..."
                          />

                          <button class="text-sm text-emerald-700" @click="saveRename(interview)">
                            Save
                          </button>

                          <button class="text-sm text-gray-500" @click="renamingId = null">
                            Cancel
                          </button>
                        </template>
                      </div>

                      <div class="mt-1 text-xs text-gray-500">
                        Started {{ formatLocalDateTime(interview.started_at) }}
                      </div>

                      <div class="mt-1 text-xs font-medium">
                        <span v-if="interview.finished_at" class="text-emerald-700">
                          Completed
                        </span>
                        <span v-else class="text-amber-600"> In Progress </span>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <button
                        class="text-sm font-medium text-emerald-700 hover:underline"
                        @click="openInterview(interview.id)"
                      >
                        {{ interview.finished_at ? 'View' : 'Resume' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </section>
        </template>
      </div>
    </div>
    <HelpDrawer
      :open="showHelpDrawer"
      title="Interviews"
      subtitle="Capture evidence from real conversations."
      what="This page manages both quick and structured interviews so you can collect and review user feedback."
      why="Interview evidence reduces guesswork and helps you validate assumptions before investing more time."
      :workflow="[
        'Start a quick or structured interview.',
        'Capture notes, evidence, and respondent context.',
        'Review grouped interviews and continue unresolved ones.'
      ]"
      :tips="[
        'Ask behavior-based questions, not leading questions.',
        'Record exact phrasing for critical responses.',
        'Follow up on contradictory signals in later interviews.'
      ]"
      :related="['Overview', 'Master Detail', 'Analytics']"
      @close="showHelpDrawer = false"
    />
  </main>
</template>
