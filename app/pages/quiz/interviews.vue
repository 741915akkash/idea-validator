<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Info, Trash2 } from 'lucide-vue-next'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import InterviewScreenFreeform from '~/components/interview/InterviewScreenFreeform.vue'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'
  import TopAlert from '~/components/ui/TopAlert.vue'
  import { useHelpContent } from '~/composables/useHelpContent'

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
  const deletingInterviewId = ref(null)
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
  const showStartInterviewModal = ref(false)
  const templateSearchQuery = ref('')
  const selectedStartTemplateId = ref(null)
  const startModalError = ref('')
  const interviewTemplates = ref([])
  const help = useHelpContent('interviews')

  async function loadInterviewTemplates() {
    const templatesRes = await $fetch('/api/interview-template/list').catch(() => ({
      templates: []
    }))
    const rows = Array.isArray(templatesRes?.templates)
      ? templatesRes.templates
      : Array.isArray(templatesRes)
        ? templatesRes
        : []

    interviewTemplates.value = rows.map((row) => ({
      ...row,
      title: row?.title || 'Untitled template',
      description: row?.description || 'No description'
    }))
  }

  async function loadInterviewData() {
    if (!quizStore.quizId) {
      interviews.value = []
      quizName.value = ''
      interviewTemplates.value = []
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
    await loadInterviewTemplates()
  }

  async function maybeOpenInterviewFromQuery() {
    const openInterviewId = route.query?.open_interview_id
    if (!openInterviewId) return

    const target = interviews.value.find(
      (interview) => String(interview.id) === String(openInterviewId)
    )
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
      await loadInterviewTemplates()
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

  async function openFreeformInterview() {
    await loadInterviewTemplates()
    showStartInterviewModal.value = true
    templateSearchQuery.value = ''
    selectedStartTemplateId.value = null
    startModalError.value =
      interviewTemplates.value.length === 0 ? 'No templates found. Create one first.' : ''
  }

  function closeStartInterviewModal() {
    showStartInterviewModal.value = false
    templateSearchQuery.value = ''
    selectedStartTemplateId.value = null
    startModalError.value = ''
  }

  function selectTemplateForStart(id) {
    selectedStartTemplateId.value = selectedStartTemplateId.value === id ? null : id
    startModalError.value = ''
  }

  async function startInterviewFromModal() {
    if (!quizStore.quizId) return
    if (!selectedStartTemplateId.value) {
      startModalError.value = 'Please select a template to start the interview.'
      return
    }
    actionError.value = null
    showFreeformLimitAlert.value = false

    await $fetch('/api/interview/freeform/start', {
      method: 'POST',
      body: {
        quiz_id: quizStore.quizId,
        template_id: selectedStartTemplateId.value
      }
    })
      .then((res) => {
        freeformInterviewId.value = res?.interview_id || null
        freeformConditionId.value = res?.condition_id || null

        if (!freeformInterviewId.value || !freeformConditionId.value) {
          throw new Error('Missing freeform context')
        }

        closeStartInterviewModal()
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

  async function deleteQuickInterview(interviewId) {
    if (!interviewId || deletingInterviewId.value) return
    const confirmed = window.confirm('Delete this quick interview? This cannot be undone.')
    if (!confirmed) return

    actionError.value = null
    deletingInterviewId.value = interviewId

    try {
      await $fetch('/api/interview/freeform/delete', {
        method: 'POST',
        body: { interview_id: interviewId }
      })
      await loadInterviewData()
    } catch (err) {
      actionError.value =
        err?.data?.statusMessage || err?.statusMessage || 'Unable to delete quick interview.'
    } finally {
      deletingInterviewId.value = null
    }
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
  const templatePreviewItems = computed(() => interviewTemplates.value.slice(0, 5))
  const modalFilteredTemplates = computed(() => {
    const q = templateSearchQuery.value.trim().toLowerCase()
    if (!q) return interviewTemplates.value
    return interviewTemplates.value.filter((template) => {
      const title = String(template?.title || '').toLowerCase()
      const description = String(template?.description || '').toLowerCase()
      const tags = String(template?.tags || '').toLowerCase()
      return title.includes(q) || description.includes(q) || tags.includes(q)
    })
  })

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
    const structured = interview.latest_structured_responses || {}
    return structured.name?.trim() || interview.respondent_info?.trim() || 'Unknown respondent'
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

    <div
      v-if="showStartInterviewModal"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
    >
      <div
        class="w-full max-w-2xl rounded-xl border border-app-border bg-app-card p-5 text-app-text shadow-xl"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-app-text">Start Interview</h3>
          <button
            class="text-sm font-medium text-app-muted hover:text-app-text"
            @click="closeStartInterviewModal"
          >
            Close
          </button>
        </div>

        <div class="mb-4">
          <input
            v-model="templateSearchQuery"
            type="text"
            placeholder="Search interview templates..."
            class="w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div class="max-h-80 space-y-2 overflow-y-auto">
          <button
            v-for="templateItem in modalFilteredTemplates"
            :key="templateItem.id"
            class="w-full rounded-lg border px-3 py-3 text-left transition"
            :class="
              selectedStartTemplateId === templateItem.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-app-border text-app-text hover:border-app-border'
            "
            @click="selectTemplateForStart(templateItem.id)"
          >
            <div class="text-sm font-semibold text-app-text">{{ templateItem.title }}</div>
            <div class="mt-1 text-xs text-app-muted">
              {{ templateItem.description || 'No description' }}
            </div>
          </button>
        </div>

        <div v-if="modalFilteredTemplates.length === 0" class="mt-3 text-sm text-app-muted">
          No templates found.
        </div>
        <div v-if="startModalError" class="mt-3 text-sm text-red-500">
          {{ startModalError }}
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button
            class="rounded-md border border-app-border px-4 py-2 text-sm font-medium text-app-muted text-app-text hover:bg-app-hover"
            @click="closeStartInterviewModal"
          >
            Cancel
          </button>
          <button
            :disabled="!selectedStartTemplateId"
            class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            @click="startInterviewFromModal"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-2xl">
      <div class="mb-8 space-y-6">
        <!-- Page header -->
        <div class="mb-6 rounded-lg border border-app-border px-6 py-5 text-app-text">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1
                class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-app-text"
              >
                <span>Interviews</span>

                <Info
                  class="h-5 w-5 cursor-pointer text-app-muted transition hover:text-app-text"
                  @click="showHelpDrawer = true"
                />
              </h1>

              <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <button
              class="rounded-md px-3 py-2 text-sm font-medium transition"
              :class="
                selectedFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-app-muted text-app-text hover:bg-app-hover'
              "
              @click="selectedFilter = 'all'"
            >
              All
            </button>

            <button
              class="rounded-md px-3 py-2 text-sm font-medium transition"
              :class="
                selectedFilter === 'quick'
                  ? 'bg-emerald-600 text-white'
                  : 'text-app-muted text-app-text hover:bg-app-hover hover:text-app-text'
              "
              @click="selectedFilter = 'quick'"
            >
              Quick
            </button>

            <button
              class="rounded-md px-3 py-2 text-sm font-medium transition"
              :class="
                selectedFilter === 'structured'
                  ? 'bg-emerald-600 text-white'
                  : 'text-app-muted text-app-text hover:bg-app-hover hover:text-app-text'
              "
              @click="selectedFilter = 'structured'"
            >
              Structured
            </button>
          </div>

          <div class="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <NuxtLink
              to="/quiz/overview"
              class="inline-flex flex-1 items-center justify-center rounded-lg border border-app-border bg-app-panel px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-hover md:flex-none"
            >
              Back to Overview
            </NuxtLink>

            <button
              class="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 md:flex-none"
              @click="openFreeformInterview"
            >
              + Start Interview
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-base text-app-muted">Loading interviews...</div>

      <div v-else>
        <div v-if="actionError" class="mb-4 text-sm text-red-500">
          {{ actionError }}
        </div>

        <!-- ALL TAB DASHBOARD -->
        <template v-if="selectedFilter === 'all'">
          <section class="mb-8">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-app-text">
                Templates ({{ interviewTemplates.length }})
              </h2>
              <NuxtLink
                to="/quiz/interview-templates"
                class="inline-flex items-center rounded-md border-2 border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
              >
                Go to Templates
              </NuxtLink>
            </div>

            <div v-if="interviewTemplates.length > 0" class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="templateItem in templatePreviewItems"
                :key="templateItem.id"
                class="rounded-lg border border-app-border p-4 text-left text-app-text transition hover:border-app-border hover:bg-app-hover"
              >
                <div class="text-base font-semibold text-app-text">
                  {{ templateItem.title }}
                </div>
                <div class="mt-2 text-sm text-app-muted">
                  {{ templateItem.description }}
                </div>
              </div>
            </div>

            <div
              v-else
              class="rounded border border-app-border bg-app-panel px-4 py-4 text-sm text-app-muted"
            >
              No templates yet.
            </div>
          </section>

          <section class="mb-8">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-app-text">
                Quick Interviews ({{ quickInterviews.length }})
              </h2>
              <button
                class="text-sm font-medium text-emerald-500 hover:underline"
                @click="selectedFilter = 'quick'"
              >
                View all →
              </button>
            </div>

            <div v-if="quickInterviews.length > 0" class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="interview in quickPreviewInterviews"
                :key="interview.id"
                class="rounded-lg border border-app-border p-4 text-left text-app-text transition hover:border-app-border hover:bg-app-hover"
                role="button"
                tabindex="0"
                @click="openQuickInterview(interview)"
              >
                <div class="mb-2 flex justify-end">
                  <button
                    class="hover:bg-red-500/100/5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-500 transition disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Delete quick interview"
                    title="Delete"
                    :disabled="deletingInterviewId === interview.id"
                    @click.stop="deleteQuickInterview(interview.id)"
                  >
                    <Trash2 v-if="deletingInterviewId !== interview.id" class="h-4 w-4" />
                    <span v-else class="text-[10px] font-medium">...</span>
                  </button>
                </div>
                <div class="text-base font-semibold text-app-text">
                  🧠 {{ quickTitle(interview) }}
                </div>
                <div class="mt-1 text-xs text-app-muted">
                  Respondent: {{ quickRespondent(interview) }}
                </div>
                <div class="mt-1 text-sm text-app-muted">"{{ quickSnippet(interview) }}"</div>
              </div>
            </div>

            <div
              v-else
              class="rounded border border-app-border bg-app-panel px-4 py-4 text-sm text-app-muted"
            >
              No quick interviews yet.
            </div>
          </section>

          <section>
            <div class="mb-4 flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-app-text">
                Structured Interviews ({{ structuredInterviews.length }})
              </h2>
              <NuxtLink
                to="/quiz/master-detail"
                class="inline-flex items-center rounded-md border-2 border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
              >
                Go to Structured Validation
              </NuxtLink>
            </div>
            <div
              v-if="groupedStructuredInterviews.length === 0"
              class="rounded border border-app-border bg-app-panel px-4 py-4 text-sm text-app-muted"
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
                      <h3 class="text-lg font-semibold text-app-text">
                        {{ group.subUncertainty }}
                      </h3>
                      <div class="text-xs text-app-muted">
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
                          <div class="font-medium text-app-text">
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
                            class="rounded border border-app-border px-2 py-1 text-sm"
                            placeholder="Respondent name, role, company..."
                          />

                          <button class="text-sm text-emerald-500" @click="saveRename(interview)">
                            Save
                          </button>

                          <button class="text-sm text-app-muted" @click="renamingId = null">
                            Cancel
                          </button>
                        </template>
                      </div>

                      <div class="mt-1 text-xs text-app-muted">
                        Started {{ new Date(interview.started_at).toLocaleDateString() }}
                      </div>

                      <div class="mt-1 text-xs font-medium">
                        <span v-if="interview.finished_at" class="text-emerald-500">
                          Completed
                        </span>
                        <span v-else class="text-amber-600"> In Progress </span>
                      </div>
                    </div>

                    <div class="flex items-center gap-4">
                      <button
                        class="text-sm font-medium text-emerald-500 hover:underline"
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
          <h2 class="mb-4 text-lg font-semibold text-app-text">
            Quick Interviews ({{ filteredQuickInterviews.length }})
          </h2>

          <div class="mb-4">
            <input
              v-model="quickSearchQuery"
              type="text"
              placeholder="Search quick interviews by title, tags, or content"
              class="w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div v-if="filteredQuickInterviews.length > 0" class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="interview in filteredQuickInterviews"
              :key="interview.id"
              class="rounded-lg border border-app-border p-4 text-left text-app-text transition hover:border-app-border hover:bg-app-hover"
              role="button"
              tabindex="0"
              @click="openQuickInterview(interview)"
            >
              <div class="mb-2 flex justify-end">
                <button
                  class="hover:bg-red-500/100/5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-500 transition disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Delete quick interview"
                  title="Delete"
                  :disabled="deletingInterviewId === interview.id"
                  @click.stop="deleteQuickInterview(interview.id)"
                >
                  <Trash2 v-if="deletingInterviewId !== interview.id" class="h-4 w-4" />
                  <span v-else class="text-[10px] font-medium">...</span>
                </button>
              </div>
              <div class="text-base font-semibold text-app-text">
                🧠 {{ quickTitle(interview) }}
              </div>
              <div class="mt-1 text-xs text-app-muted">
                Respondent: {{ quickRespondent(interview) }}
              </div>
              <div class="mt-1 text-sm text-app-muted">"{{ quickSnippet(interview) }}"</div>
            </div>
          </div>

          <div
            v-else
            class="rounded border border-app-border bg-app-panel px-4 py-4 text-sm text-app-muted"
          >
            No quick interviews yet.
          </div>
        </section>

        <!-- STRUCTURED TAB -->
        <section v-else>
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-app-text">
              Structured Interviews ({{ structuredInterviewsForTab.length }})
            </h2>
            <NuxtLink
              to="/quiz/master-detail"
              class="inline-flex items-center rounded-md border-2 border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
            >
              Go to Structured Validation
            </NuxtLink>
          </div>

          <div class="my-5">
            <select
              v-model="structuredStatusFilter"
              class="w-64 rounded border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          <div
            v-if="groupedStructuredInterviewsForTab.length === 0"
            class="rounded border border-app-border bg-app-panel px-4 py-4 text-sm text-app-muted"
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
                    <h3 class="text-lg font-semibold text-app-text">
                      {{ group.subUncertainty }}
                    </h3>

                    <div class="text-xs text-app-muted">
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

              <div class="mt-4 border-t border-app-border"></div>

              <div class="divide-y divide-app-border">
                <div
                  v-for="interview in group.interviews"
                  :key="interview.id"
                  class="flex items-center justify-between py-4"
                >
                  <div class="flex-1">
                    <div class="group flex items-center gap-2">
                      <template v-if="renamingId !== interview.id">
                        <div class="font-medium text-app-text">
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
                          class="rounded border border-app-border px-2 py-1 text-sm"
                          placeholder="Respondent name, role, company..."
                        />

                        <button class="text-sm text-emerald-500" @click="saveRename(interview)">
                          Save
                        </button>

                        <button class="text-sm text-app-muted" @click="renamingId = null">
                          Cancel
                        </button>
                      </template>
                    </div>

                    <div class="mt-1 text-xs text-app-muted">
                      Started {{ formatLocalDateTime(interview.started_at) }}
                    </div>

                    <div class="mt-1 text-xs font-medium">
                      <span v-if="interview.finished_at" class="text-emerald-500"> Completed </span>
                      <span v-else class="text-amber-600"> In Progress </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <button
                      class="text-sm font-medium text-emerald-500 hover:underline"
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
      </div>
    </div>
    <HelpDrawer :open="showHelpDrawer" :content="help" @close="showHelpDrawer = false" />
  </main>
</template>
