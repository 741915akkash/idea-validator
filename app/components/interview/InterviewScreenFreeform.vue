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

    try {
      await $fetch('/api/interview-template/answers/upsert', {
        method: 'POST',

        body: {
          interview_id: props.interviewId,

          snapshot_question_id: question.id,

          answer_text: typeof value === 'string' ? value : null,

          answer_json: typeof value === 'object' ? value : null
        }
      })
    } catch (err) {
      console.error(err)
    }
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

    saveAnswer(question, answers.value[question.id])
  }

  async function hydrateDraft() {
    if (!props.interviewId) return

    try {
      isHydratingDraft.value = true

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
        answers.value[answer.snapshot_question_id] = answer.answer_json ?? answer.answer_text
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
  <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-50 p-4 md:p-6">
    <div
      class="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <button
        @click="showRespondent = !showRespondent"
        class="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium uppercase text-neutral-700"
      >
        {{ showRespondent ? 'Hide respondent' : 'Show respondent' }}
      </button>

      <!-- RESPONDENT -->
      <div v-if="showRespondent" class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs font-medium uppercase text-black">Respondent Name</div>
          <input
            v-model="name"
            type="text"
            placeholder="John Doe"
            class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-black">Email</div>
          <input
            v-model="email"
            type="text"
            placeholder="john@example.com"
            class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-black">Phone</div>
          <input
            v-model="phone"
            type="text"
            placeholder="+123456789"
            class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-black">Company</div>
          <input
            v-model="company"
            type="text"
            placeholder="Acme Inc"
            class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <!-- TITLE + TAGS -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div class="text-xs font-medium uppercase text-black">Title</div>
          <input
            v-model="title"
            type="text"
            placeholder="Add interview title"
            class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div class="text-xs font-medium uppercase text-black">Tags</div>
          <input
            v-model="tags"
            type="text"
            placeholder="Add tags (comma-separated)"
            class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <!-- MAIN 2 COLUMN LAYOUT -->
      <div class="grid flex-1 grid-cols-2 gap-4">
        <!-- QUESTIONS -->
        <div class="flex min-h-[600px] flex-col rounded-lg border border-neutral-200 bg-neutral-50">
          <div
            class="border-b border-neutral-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-700"
          >
            Questions
          </div>

          <div class="flex-1 space-y-2 overflow-y-auto p-3">
            <button
              v-for="(question, index) in questions"
              :key="question.id"
              class="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <div class="flex items-start gap-2">
                <div
                  class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-[10px] font-semibold text-neutral-600"
                >
                  {{ index + 1 }}
                </div>

                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-neutral-900">
                    {{ question.text }}
                  </div>

                  <div class="mt-1 text-xs text-neutral-500">
                    {{ question.question_type }}
                  </div>

                  <!-- OPEN TEXT -->
                  <textarea
                    v-if="question.question_type === 'open_text'"
                    v-model="answers[question.id]"
                    @input="saveAnswer(question, answers[question.id])"
                    placeholder="Type answer..."
                    class="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />

                  <!-- YES / NO -->
                  <div v-else-if="question.question_type === 'yes_no'" class="mt-3 flex gap-2">
                    <button
                      @click="
                        answers[question.id] = 'yes';
                        saveAnswer(question, 'yes')
                      "
                      :class="
                        answers[question.id] === 'yes'
                          ? 'border-emerald-500 bg-emerald-100'
                          : 'border-neutral-300 bg-white'
                      "
                      class="rounded-full border px-4 py-2 text-xs font-medium"
                    >
                      Yes
                    </button>

                    <button
                      @click="
                        answers[question.id] = 'no';
                        saveAnswer(question, 'no')
                      "
                      :class="
                        answers[question.id] === 'no'
                          ? 'border-red-500 bg-red-100'
                          : 'border-neutral-300 bg-white'
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
                        answers[question.id] = option;
                        saveAnswer(question, option)
                      "
                      :class="
                        answers[question.id] === option
                          ? 'border-emerald-500 bg-emerald-100'
                          : 'border-neutral-300 bg-white'
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
                          ? 'border-emerald-500 bg-emerald-100'
                          : 'border-neutral-300 bg-white'
                      "
                      class="rounded-full border px-4 py-2 text-xs font-medium"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- NOTES -->
        <div class="flex min-h-[600px] flex-col gap-2">
          <div class="text-xs font-medium uppercase text-black">Interview Notes</div>

          <textarea
            v-model="notes"
            class="min-h-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />

          <SavedStatus v-if="savedDraft" />
        </div>
      </div>
    </div>
  </div>
</template>
