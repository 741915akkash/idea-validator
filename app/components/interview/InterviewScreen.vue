<script setup>
  import { ref, computed, watch, onBeforeUnmount } from 'vue'
  import { useInterviewSession } from '@/stores/interviewSession'
  import { useInterviewApi } from '@/composables/useInterviewApi'

  const interview = useInterviewSession()
  const api = useInterviewApi()

  const loading = ref(false)
  const error = ref(null)
  const showRespondent = ref(false)
  const isFullscreen = ref(true)
  const isHydratingDraft = ref(false)

  const mobileTab = ref('notes') // notes | evidence
  const isDesktop = ref(false)

  function updateScreenSize() {
    isDesktop.value = window.innerWidth >= 768
  }

  const respondentName = computed({
    get: () => interview.respondentName,
    set: (v) => (interview.respondentName = v)
  })

  const notes = ref('')
  const evidence = ref('')
  const structuredResponses = ref({})
  const savedDraft = ref(false)

  const lastSavedRespondent = ref(interview.respondentName || '')
  const lastSavedDraftByCondition = ref({})

  let respondentSaveTimer = null
  let evidenceSaveTimer = null

  watch(
    () => interview.respondentName,
    () => {
      if (respondentSaveTimer) clearTimeout(respondentSaveTimer)

      respondentSaveTimer = setTimeout(() => {
        if (interview.respondentName === lastSavedRespondent.value) return
        interview.saveRespondent().catch(() => {})
        lastSavedRespondent.value = interview.respondentName
      }, 1500)
    }
  )

  onMounted(() => {
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateScreenSize)

    if (respondentSaveTimer) {
      clearTimeout(respondentSaveTimer)
      respondentSaveTimer = null
      interview.saveRespondent().catch(() => {})
    }

    if (evidenceSaveTimer) {
      clearTimeout(evidenceSaveTimer)
      evidenceSaveTimer = null
      saveEvidenceDraft().catch(() => {})
    }
  })

  const current = computed(() => interview.currentCondition)

  const questionsForCurrent = computed(() => {
    if (!current.value) return []
    return (interview.interviewQuestions || []).filter(
      (q) => String(q.condition_id) === String(current.value.id)
    )
  })

  const evidenceForCurrent = computed(() => {
    if (!current.value) return null

    const matches = interview.evidenceEntries.filter(
      (entry) => String(entry.condition_id) === String(current.value.id)
    )

    if (!matches.length) return null
    return matches[matches.length - 1]
  })

  watch(
    () => current.value?.id,
    (conditionId) => {
      isHydratingDraft.value = true
      savedDraft.value = false

      notes.value = evidenceForCurrent.value?.notes || ''
      evidence.value = evidenceForCurrent.value?.evidence_log || ''

      if (conditionId) {
        lastSavedDraftByCondition.value[conditionId] = {
          notes: notes.value,
          evidence_log: evidence.value
        }
      }

      setTimeout(() => {
        isHydratingDraft.value = false
      }, 0)
    },
    { immediate: true }
  )

  async function saveEvidenceDraft() {
    if (!current.value) return
    if (!interview.interviewId) return

    const conditionId = current.value.id
    const lastSaved = lastSavedDraftByCondition.value[conditionId]

    if (lastSaved && lastSaved.notes === notes.value && lastSaved.evidence_log === evidence.value) {
      return
    }

    const hasExistingDraft = !!evidenceForCurrent.value
    const emptyDraft = !notes.value?.trim() && !evidence.value?.trim()

    if (!hasExistingDraft && emptyDraft) return

    try {
      const res = await api.upsertEvidence({
        interview_id: interview.interviewId,
        condition_id: current.value.id,
        respondent_name: respondentName.value,
        notes: notes.value,
        evidence_log: evidence.value,
        structured_responses: structuredResponses.value
      })

      interview.addEvidenceLocally(res.evidence)

      lastSavedDraftByCondition.value[conditionId] = {
        notes: notes.value,
        evidence_log: evidence.value
      }

      savedDraft.value = true
    } catch (_) {}
  }

  watch([notes, evidence, () => current.value?.id], () => {
    if (isHydratingDraft.value) return
    if (!current.value) return

    savedDraft.value = false

    if (evidenceSaveTimer) clearTimeout(evidenceSaveTimer)

    evidenceSaveTimer = setTimeout(() => {
      saveEvidenceDraft()
    }, 1500)
  })

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }
  function toggleMobileTab() {
    mobileTab.value = mobileTab.value === 'notes' ? 'evidence' : 'notes'
  }

  async function resolve(status) {
    if (!current.value || loading.value) return

    const wasLastPendingCondition =
      interview.phase === 'resolve' &&
      current.value.status === 'pending' &&
      interview.conditions.filter((c) => c.status === 'pending').length === 1

    loading.value = true
    error.value = null

    try {
      if (evidenceSaveTimer) {
        clearTimeout(evidenceSaveTimer)
        evidenceSaveTimer = null
      }

      await saveEvidenceDraft()

      await api.updateCondition({
        interviewId: interview.interviewId,
        conditionId: current.value.id,
        status
      })

      interview.resolveCondition({
        conditionId: current.value.id,
        status
      })

      if (wasLastPendingCondition) {
        interview.goToNextPhase()
      }
    } catch {
      error.value = 'Unable to record result.'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div
    v-if="current"
    :class="[
      isFullscreen
        ? 'fixed inset-0 z-50 flex flex-col gap-4 overflow-hidden bg-white p-4 md:p-6'
        : 'mx-auto max-w-6xl space-y-6 px-4 py-4 md:px-6 md:py-6'
    ]"
  >
    <!-- FULLSCREEN -->
    <button
      @click="toggleFullscreen"
      class="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium uppercase text-neutral-700 hover:bg-neutral-200"
    >
      {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
    </button>

    <!-- RESPONDENT -->
    <button
      @click="showRespondent = !showRespondent"
      class="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium uppercase text-neutral-700"
    >
      {{ showRespondent ? 'Hide respondent' : 'Show respondent' }}
    </button>

    <div v-if="showRespondent">
      <div class="text-xs font-medium uppercase text-neutral-500">Respondent</div>

      <textarea
        v-model="respondentName"
        class="mt-1 h-20 w-full resize-none overflow-y-auto rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>

    <!-- CONDITION -->
    <div>
      <div class="text-xs font-medium uppercase text-neutral-500">Condition</div>

      <div class="mt-1 text-lg font-semibold md:text-xl">
        {{ current.description }}
      </div>
    </div>

    <!-- QUESTIONS -->
    <div>
      <div class="text-xs font-medium uppercase text-neutral-500">Questions</div>

      <ul class="mt-2 space-y-1 text-base md:text-lg">
        <li v-for="q in questionsForCurrent" :key="q.id">• {{ q.text }}</li>
      </ul>
    </div>

    <!-- MOBILE TEXTAREA SWITCH -->
    <div class="md:hidden">
      <button
        @click="toggleMobileTab"
        class="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        {{ mobileTab === 'notes' ? 'Switch to Evidence' : 'Switch to Notes' }}
      </button>
    </div>

    <!-- WORKSPACE -->
    <div
      :class="[
        isFullscreen ? 'grid min-h-0 flex-1 gap-4 md:grid-cols-2' : 'grid gap-6 md:grid-cols-2'
      ]"
    >
      <!-- NOTES -->
      <div v-show="mobileTab === 'notes' || isDesktop" class="flex min-h-0 flex-col gap-2">
        <div class="text-xs font-medium uppercase text-neutral-500">
          Interview Notes
        </div>

        <textarea
          v-model="notes"
          :class="[
            'w-full resize-none overflow-y-auto rounded-md border border-neutral-300 px-3 py-2 text-sm',
            isFullscreen ? 'flex-1' : 'h-56 md:h-64'
          ]"
        />

        <SavedStatus v-if="savedDraft" />
      </div>

      <!-- EVIDENCE -->
      <div v-show="mobileTab === 'evidence' || isDesktop" class="flex min-h-0 flex-col gap-2">
        <div class="text-xs font-medium uppercase text-neutral-500">
          Evidence Logged
        </div>

        <textarea
          v-model="evidence"
          :class="[
            'w-full resize-none overflow-y-auto rounded-md border border-neutral-300 px-3 py-2 text-sm',
            isFullscreen ? 'flex-1' : 'h-56 md:h-64'
          ]"
        />

        <SavedStatus v-if="savedDraft" />
      </div>
    </div>

    <!-- DECISION -->
    <div :class="isFullscreen ? 'mt-auto border-t pt-4' : 'border-t pt-6'">
      <div class="text-xs font-medium uppercase text-neutral-500">Decision</div>

      <div class="mt-3 flex flex-col gap-3 md:flex-row md:justify-between">
        <div class="flex gap-2">
          <button
            @click="interview.goToPreviousPhase()"
            class="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          >
            ← Previous
          </button>

          <button
            @click="interview.goToNextPhase()"
            class="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          >
            Next →
          </button>
        </div>

        <div class="flex gap-2">
          <button
            @click="resolve('failed')"
            class="rounded-md border border-neutral-400 px-4 py-2 text-sm"
          >
            Condition Failed
          </button>

          <button
            @click="resolve('met')"
            class="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            Condition Met
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>
