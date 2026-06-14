<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import SavedStatus from '~/components/ui/SavedStatus.vue'

  const props = defineProps({
    interviewId: {
      type: String,
      default: null
    },
    conditionId: {
      type: String,
      default: null
    }
  })

  const showRespondent = ref(true)

  const mobileTab = ref('notes') // notes | evidence
  const isDesktop = ref(false)

  const title = ref('')
  const tags = ref('')
  const notes = ref('')
  const evidence = ref('')
  const questions = ref([])
  const answers = ref({})
  const savedDraft = ref(false)
  const isHydratingDraft = ref(false)
  const pendingAnswerSaves = new Map()
  const answerSaveTimers = new Map()

  // ✅ NEW structured fields
  const name = ref('')
  const email = ref('')
  const phone = ref('')
  const company = ref('')

  const canAutosave = computed(() => {
    return !!props.interviewId && !!props.conditionId
  })

  const lastSavedSnapshot = ref({
    title: '',
    tags: '',
    notes: '',
    evidence_log: '',
    name: '',
    email: '',
    phone: '',
    company: ''
  })

  let autosaveTimer = null

  function updateScreenSize() {
    isDesktop.value = window.innerWidth >= 768
  }

  onMounted(() => {
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateScreenSize)

    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
      autosaveTimer = null
      saveDraft().catch(() => {})
    }

    flushPendingAnswerSaves().catch(() => {})
  })

  function toggleMobileTab() {
    mobileTab.value = mobileTab.value === 'notes' ? 'evidence' : 'notes'
  }

  function currentSnapshot() {
    return {
      title: title.value || '',
      tags: tags.value || '',
      notes: notes.value || '',
      evidence_log: evidence.value || '',
      name: name.value || '',
      email: email.value || '',
      phone: phone.value || '',
      company: company.value || ''
    }
  }

  async function saveDraft() {
    if (!canAutosave.value) return

    const snapshot = currentSnapshot()
    const last = lastSavedSnapshot.value

    if (
      snapshot.title === last.title &&
      snapshot.tags === last.tags &&
      snapshot.notes === last.notes &&
      snapshot.evidence_log === last.evidence_log &&
      snapshot.name === last.name &&
      snapshot.email === last.email &&
      snapshot.phone === last.phone &&
      snapshot.company === last.company
    ) {
      return
    }

    const isEmpty =
      !snapshot.title.trim() &&
      !snapshot.tags.trim() &&
      !snapshot.notes.trim() &&
      !snapshot.evidence_log.trim() &&
      !snapshot.name.trim() &&
      !snapshot.email.trim() &&
      !snapshot.phone.trim() &&
      !snapshot.company.trim()

    if (isEmpty) return

    await $fetch('/api/evidence/upsert', {
      method: 'POST',
      body: {
        interview_id: props.interviewId,
        condition_id: props.conditionId,
        notes: snapshot.notes,
        evidence_log: snapshot.evidence_log,
        structured_responses: {
          title: snapshot.title,
          tags: snapshot.tags,
          name: snapshot.name,
          email: snapshot.email,
          phone: snapshot.phone,
          company: snapshot.company
        }
      }
    })

    lastSavedSnapshot.value = snapshot
    savedDraft.value = true
  }

  async function saveAnswer(question, value) {
    if (!props.interviewId) return

    const answerText =
      typeof value === 'number' || typeof value === 'boolean' ? String(value) : value

    try {
      await $fetch('/api/interview-template/answers/upsert', {
        method: 'POST',

        body: {
          interview_id: props.interviewId,

          snapshot_question_id: question.id,

          answer_text: typeof answerText === 'string' ? answerText : null,

          answer_json: Array.isArray(value) || (value && typeof value === 'object') ? value : null
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  function queueAnswerSave(question, value) {
    if (!props.interviewId || !question?.id) return

    pendingAnswerSaves.set(question.id, {
      question,
      value
    })

    if (answerSaveTimers.has(question.id)) {
      clearTimeout(answerSaveTimers.get(question.id))
    }

    answerSaveTimers.set(
      question.id,
      setTimeout(() => {
        flushQueuedAnswerSave(question.id).catch(() => {})
      }, 250)
    )
  }

  async function flushQueuedAnswerSave(questionId) {
    const queued = pendingAnswerSaves.get(questionId)
    if (!queued) return

    pendingAnswerSaves.delete(questionId)

    if (answerSaveTimers.has(questionId)) {
      clearTimeout(answerSaveTimers.get(questionId))
      answerSaveTimers.delete(questionId)
    }

    await saveAnswer(queued.question, queued.value)
  }

  async function flushPendingAnswerSaves() {
    await Promise.all(
      [...pendingAnswerSaves.keys()].map((questionId) => flushQueuedAnswerSave(questionId))
    )
  }

  function toggleMulti(question, option) {
    if (!Array.isArray(answers.value[question.id])) {
      answers.value[question.id] = []
    }

    const existing = answers.value[question.id]

    if (existing.includes(option)) {
      answers.value[question.id] = existing.filter((o) => o !== option)
    } else {
      answers.value[question.id] = [...existing, option]
    }

    queueAnswerSave(question, answers.value[question.id])
  }

  function getRatingValues(question) {
    const min = Number(question?.options_json?.min ?? 1)
    const max = Number(question?.options_json?.max ?? 5)

    if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
      return [1, 2, 3, 4, 5]
    }

    return Array.from({ length: max - min + 1 }, (_, index) => min + index)
  }

  function selectRating(question, value) {
    answers.value[question.id] = value
    queueAnswerSave(question, value)
  }

  async function hydrateDraft() {
    if (!props.interviewId) return

    try {
      isHydratingDraft.value = true
      pendingAnswerSaves.clear()
      for (const timer of answerSaveTimers.values()) {
        clearTimeout(timer)
      }
      answerSaveTimers.clear()
      answers.value = {}

      const res = await $fetch('/api/interview/freeform/get', {
        query: { interview_id: props.interviewId }
      })

      const latest = res?.evidence || null
      const structured = latest?.structured_responses || {}

      title.value = structured?.title || ''
      tags.value = structured?.tags || ''
      notes.value = latest?.notes || ''
      evidence.value = latest?.evidence_log || ''

      name.value = structured?.name || ''
      email.value = structured?.email || ''
      phone.value = structured?.phone || ''
      company.value = structured?.company || ''
      questions.value = Array.isArray(res?.template_questions) ? res.template_questions : []
      const answersRes = await $fetch('/api/interview-template/answers/list', {
        query: {
          interview_id: props.interviewId
        }
      })

      for (const answer of answersRes.answers || []) {
        if (answer.question_type === 'rating') {
          const parsedRating = Number(answer.answer_text)
          answers.value[answer.snapshot_question_id] = Number.isFinite(parsedRating)
            ? parsedRating
            : ''
        } else {
          answers.value[answer.snapshot_question_id] =
            answer.answer_json !== null && answer.answer_json !== undefined
              ? answer.answer_json
              : answer.answer_text || ''
        }
      }

      lastSavedSnapshot.value = currentSnapshot()
      savedDraft.value = !!latest
    } catch {
      // ignore
    } finally {
      setTimeout(() => {
        isHydratingDraft.value = false
      }, 0)
    }
  }

  async function flushAndSave() {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
      autosaveTimer = null
    }

    await saveDraft()
    await flushPendingAnswerSaves()

    // 🔥 trigger CRM creation
    await $fetch('/api/interview/add-to-crm/add-to-crm', {
      method: 'POST',
      body: {
        interview_id: props.interviewId
      }
    })
  }

  watch(
    [
      title,
      tags,
      notes,
      evidence,
      name,
      email,
      phone,
      company,
      () => props.interviewId,
      () => props.conditionId
    ],
    () => {
      if (isHydratingDraft.value) return
      if (!canAutosave.value) return

      savedDraft.value = false

      if (autosaveTimer) clearTimeout(autosaveTimer)
      autosaveTimer = setTimeout(() => {
        saveDraft().catch(() => {})
      }, 1500)
    }
  )

  watch(
    () => props.interviewId,
    () => {
      hydrateDraft().catch(() => {})
    },
    { immediate: true }
  )

  defineExpose({
    flushAndSave
  })
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-app-bg p-4 md:p-6">
    <div
      class="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 rounded-xl border border-app-border p-4 text-app-text shadow-sm md:p-6"
    >
      <button
        @click="showRespondent = !showRespondent"
        class="rounded-md bg-app-panel px-3 py-2 text-xs font-medium uppercase text-app-muted"
      >
        {{ showRespondent ? 'Hide respondent' : 'Show respondent' }}
      </button>

      <!-- RESPONDENT -->
      <div v-if="showRespondent" class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs font-medium uppercase text-app-text">Respondent Name</div>
          <input
            v-model="name"
            type="text"
            placeholder="John Doe"
            class="mt-1 w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-app-text">Email</div>
          <input
            v-model="email"
            type="text"
            placeholder="john@example.com"
            class="mt-1 w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-app-text">Phone</div>
          <input
            v-model="phone"
            type="text"
            placeholder="+123456789"
            class="mt-1 w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-app-text">Company</div>
          <input
            v-model="company"
            type="text"
            placeholder="Acme Inc"
            class="mt-1 w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <!-- TITLE + TAGS -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs font-medium uppercase text-app-text">Title</div>
          <input
            v-model="title"
            type="text"
            placeholder="Add interview title"
            class="mt-1 w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-app-text">Tags</div>
          <input
            v-model="tags"
            type="text"
            placeholder="Add tags (comma-separated)"
            class="mt-1 w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <!-- MAIN 2 COLUMN LAYOUT -->
      <div class="grid flex-1 grid-cols-2 gap-4">
        <!-- QUESTIONS -->
        <div class="flex min-h-[600px] flex-col rounded-lg border border-app-border bg-app-panel">
          <div
            class="border-b border-app-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-app-muted"
          >
            Questions
          </div>

          <div class="flex-1 space-y-2 overflow-y-auto p-3">
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              class="w-full rounded-lg border border-app-border p-3 text-left text-app-text transition hover:border-emerald-300 hover:bg-emerald-500/10"
            >
              <div class="flex items-start gap-2">
                <div
                  class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-app-border text-[10px] font-semibold text-app-muted"
                >
                  {{ index + 1 }}
                </div>

                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-app-text">
                    {{ question.text }}
                  </div>

                  <div class="mt-1 text-xs text-app-muted">
                    {{ question.question_type }}
                  </div>

                  <!-- OPEN TEXT -->
                  <textarea
                    v-if="question.question_type === 'open_text'"
                    v-model="answers[question.id]"
                    @input="queueAnswerSave(question, answers[question.id])"
                    placeholder="Type answer..."
                    class="mt-3 w-full rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />

                  <!-- YES / NO -->
                  <div v-else-if="question.question_type === 'yes_no'" class="mt-3 flex gap-2">
                    <button
                      @click="
                        () => {
                          answers[question.id] = 'yes'
                          queueAnswerSave(question, 'yes')
                        }
                      "
                      :class="
                        answers[question.id] === 'yes'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-app-border bg-app-panel text-app-text hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      "
                      class="rounded-full border px-4 py-2 text-xs font-medium"
                    >
                      Yes
                    </button>

                    <button
                      @click="
                        () => {
                          answers[question.id] = 'no'
                          queueAnswerSave(question, 'no')
                        }
                      "
                      :class="
                        answers[question.id] === 'no'
                          ? 'bg-red-500/100/5/10 border-red-500/20 text-red-500'
                          : 'border-app-border bg-app-panel text-app-text hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      "
                      class="rounded-full border px-4 py-2 text-xs font-medium"
                    >
                      No
                    </button>
                  </div>

                  <!-- SINGLE SELECT -->
                  <div
                    v-else-if="question.question_type === 'single_select'"
                    class="mt-3 flex flex-wrap gap-2"
                  >
                    <button
                      v-for="option in question.options_json?.options || []"
                      :key="option"
                      @click="
                        () => {
                          answers[question.id] = option
                          queueAnswerSave(question, option)
                        }
                      "
                      :class="
                        answers[question.id] === option
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-app-border bg-app-panel text-app-text hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      "
                      class="rounded-full border px-4 py-2 text-xs font-medium"
                    >
                      {{ option }}
                    </button>
                  </div>

                  <!-- MULTI SELECT -->
                  <div
                    v-else-if="question.question_type === 'multi_select'"
                    class="mt-3 flex flex-wrap gap-2"
                  >
                    <button
                      v-for="option in question.options_json?.options || []"
                      :key="option"
                      @click="toggleMulti(question, option)"
                      :class="
                        (answers[question.id] || []).includes(option)
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-app-border bg-app-panel text-app-text hover:border-emerald-500/30 hover:bg-emerald-500/5'
                      "
                      class="rounded-full border px-4 py-2 text-xs font-medium"
                    >
                      {{ option }}
                    </button>
                  </div>

                  <!-- RATING -->
                  <div v-else-if="question.question_type === 'rating'" class="mt-3 space-y-3">
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="value in getRatingValues(question)"
                        :key="value"
                        @click="selectRating(question, value)"
                        :class="
                          answers[question.id] === value
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                            : 'border-app-border bg-app-panel text-app-text hover:border-emerald-500/30 hover:bg-emerald-500/5'
                        "
                        class="min-w-[2.5rem] rounded-full border px-4 py-2 text-xs font-medium transition"
                      >
                        {{ value }}
                      </button>
                    </div>

                    <div class="text-xs text-app-muted">
                      Choose a rating from {{ getRatingValues(question)[0] }} to
                      {{ getRatingValues(question)[getRatingValues(question).length - 1] }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTES -->
        <div class="flex min-h-[600px] flex-col gap-2">
          <div class="text-xs font-medium uppercase text-app-text">Interview Notes</div>

          <textarea
            v-model="notes"
            class="min-h-0 flex-1 rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          <SavedStatus v-if="savedDraft" />
        </div>
      </div>
    </div>
  </div>
</template>
