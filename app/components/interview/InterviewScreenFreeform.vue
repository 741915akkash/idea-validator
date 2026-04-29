<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { useInterviewSession } from '@/stores/interviewSession'

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

  const interview = useInterviewSession()

  const showRespondent = ref(true)

  const mobileTab = ref('notes') // notes | evidence
  const isDesktop = ref(false)

  const title = ref('')
  const tags = ref('')
  const notes = ref('')
  const evidence = ref('')
  const savedDraft = ref(false)
  const isHydratingDraft = ref(false)

  const respondentName = computed({
    get: () => interview.respondentName,
    set: (v) => (interview.respondentName = v)
  })

  const canAutosave = computed(() => {
    return !!props.interviewId && !!props.conditionId
  })

  const lastSavedSnapshot = ref({
    title: '',
    tags: '',
    notes: '',
    evidence_log: ''
  })

  let autosaveTimer = null
  let respondentSaveTimer = null

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

    if (respondentSaveTimer) {
      clearTimeout(respondentSaveTimer)
      respondentSaveTimer = null
      interview.saveRespondent().catch(() => {})
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
      evidence_log: evidence.value || ''
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
      snapshot.evidence_log === last.evidence_log
    ) {
      return
    }

    const isEmpty =
      !snapshot.title.trim() &&
      !snapshot.tags.trim() &&
      !snapshot.notes.trim() &&
      !snapshot.evidence_log.trim()

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
          tags: snapshot.tags
        }
      }
    })

    lastSavedSnapshot.value = snapshot
    savedDraft.value = true
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

      if (res?.interview?.respondent_info) {
        interview.respondentName = res.interview.respondent_info
      } else if (latest?.respondent_name) {
        interview.respondentName = latest.respondent_name
      }

      lastSavedSnapshot.value = {
        title: title.value || '',
        tags: tags.value || '',
        notes: notes.value || '',
        evidence_log: evidence.value || ''
      }

      savedDraft.value = !!latest
    } catch {
      // Ignore hydration errors; user can still type and autosave.
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
    await interview.saveRespondent().catch(() => {})
  }

  watch([title, tags, notes, evidence, () => props.interviewId, () => props.conditionId], () => {
    if (isHydratingDraft.value) return
    if (!canAutosave.value) return

    savedDraft.value = false

    if (autosaveTimer) clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      saveDraft().catch(() => {})
    }, 1500)
  })

  watch(
    () => interview.respondentName,
    () => {
      if (respondentSaveTimer) clearTimeout(respondentSaveTimer)

      respondentSaveTimer = setTimeout(() => {
        interview.saveRespondent().catch(() => {})
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
  <div class="fixed inset-0 z-50 flex flex-col gap-4 overflow-hidden bg-white p-4 md:p-6">

    <button
      @click="showRespondent = !showRespondent"
      class="rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium uppercase text-neutral-700"
    >
      {{ showRespondent ? 'Hide respondent' : 'Show respondent' }}
    </button>

    <div v-if="showRespondent">
      <div class="text-xs font-medium uppercase text-black">Respondent</div>

      <textarea
        v-model="respondentName"
        class="mt-1 h-20 w-full resize-none overflow-y-auto rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>

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

    <div class="md:hidden">
      <button
        @click="toggleMobileTab"
        class="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        {{ mobileTab === 'notes' ? 'Switch to Evidence' : 'Switch to Notes' }}
      </button>
    </div>

    <div
      class="grid min-h-0 flex-1 gap-4 md:grid-cols-2"
    >
      <div v-show="mobileTab === 'notes' || isDesktop" class="flex min-h-0 flex-col gap-2">
        <div class="text-xs font-medium uppercase text-black">
          Interview Notes
        </div>

        <textarea
          v-model="notes"
          class="w-full flex-1 resize-none overflow-y-auto rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />

        <SavedStatus v-if="savedDraft" />
      </div>

      <div v-show="mobileTab === 'evidence' || isDesktop" class="flex min-h-0 flex-col gap-2">
        <div class="text-xs font-medium uppercase text-black">
          Evidence Logged
        </div>

        <textarea
          v-model="evidence"
          class="w-full flex-1 resize-none overflow-y-auto rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />

        <SavedStatus v-if="savedDraft" />
      </div>
    </div>
  </div>
</template>
