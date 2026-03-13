<!-- app/components/interview/CompletionSummary.vue -->

<script setup>
  import { computed, ref, watch, onBeforeUnmount } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useInterviewSession } from '@/stores/interviewSession'
  import { useInterviewApi } from '@/composables/useInterviewApi'

  const interview = useInterviewSession()
  const router = useRouter()
  const route = useRoute()
  const api = useInterviewApi()

  const loading = ref(false)
  const error = ref(null)
  const respondentSaved = ref(false)
  const lastSavedRespondent = ref(interview.respondentName || '')
  let respondentSaveTimer = null

  const isMet = computed(() => interview.completionStatus === 'met')
  const respondentName = computed({
    get: () => interview.respondentName,
    set: (v) => (interview.respondentName = v)
  })

  watch(
    () => interview.respondentName,
    () => {
      respondentSaved.value = false

      if (respondentSaveTimer) clearTimeout(respondentSaveTimer)

      respondentSaveTimer = setTimeout(() => {
        if (interview.respondentName === lastSavedRespondent.value) return
        interview
          .saveRespondent()
          .then(() => {
            lastSavedRespondent.value = interview.respondentName
            respondentSaved.value = true
          })
          .catch(() => {})
      }, 1500)
    }
  )

  onBeforeUnmount(() => {
    if (!respondentSaveTimer) return
    clearTimeout(respondentSaveTimer)
    respondentSaveTimer = null
    if (interview.respondentName !== lastSavedRespondent.value) {
      interview.saveRespondent().catch(() => {})
    }
  })

  async function interviewAgain() {
    if (loading.value) return

    const quizId = interview.quizId || route.query.quiz_id
    const subUncertaintyId = interview.selectedSub?.id
    const goalId = interview.goal?.id

    if (!quizId || !subUncertaintyId || !goalId) {
      error.value = 'Unable to start new interview. Missing interview context.'
      return
    }

    loading.value = true
    error.value = null

    try {
      // Re-save the current template so the new interview uses exactly this structure.
      await $fetch('/api/sub_uncertainty/update-goal', {
        method: 'POST',
        body: {
          goal_id: goalId,
          statement: interview.goal?.statement || ''
        }
      })

      const conditionsPayload = (interview.conditions || []).map((condition) => ({
        description: condition.description,
        questions: (interview.interviewQuestions || [])
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

      const res = await api.startInterview({
        quizId,
        subUncertaintyId
      })

      router.push(`/quiz/interview/${res.interview_id}?quiz_id=${quizId}`)
    } catch (err) {
      error.value = 'Unable to start another interview.'
    } finally {
      loading.value = false
    }
  }

  function goToInterviews() {
    router.push('/quiz/interviews')
  }

  function goToMasterDetail() {
    const quizId = interview.quizId || route.query.quiz_id
    const uncertaintyId = interview.selectedSub?.uncertainty_id
    const subUncertaintyId = interview.selectedSub?.id

    const query = new URLSearchParams()
    if (quizId) query.set('quiz_id', String(quizId))
    if (uncertaintyId) query.set('uncertainty_id', String(uncertaintyId))
    if (subUncertaintyId) query.set('sub_uncertainty_id', String(subUncertaintyId))

    const queryString = query.toString()
    router.push(queryString ? `/quiz/master-detail?${queryString}` : '/quiz/master-detail')
  }

  function goToPrevious() {
    interview.goToPreviousPhase()
  }
</script>

<template>
  <div>
    <!-- Title -->
    <div>
      <h2 class="text-xl font-semibold text-neutral-900">Resolution Complete</h2>

      <div class="mt-5">
        <div class="text-xs font-medium uppercase tracking-wide text-neutral-500">Respondent</div>

        <textarea
          v-model="respondentName"
          rows="2"
          class="mt-2 w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />

        <span v-if="respondentSaved" class="mt-1 inline-block text-xs text-green-600">Saved ✓</span>
      </div>
    </div>

    <!-- Conditions Summary -->
    <div class="mt-10">
      <div class="text-xl font-medium text-neutral-700">Condition Results</div>

      <div class="mt-4 space-y-3">
        <div
          v-for="condition in interview.conditions"
          :key="condition.id"
          class="flex items-start gap-3"
        >
          <div
            class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-sm text-xs font-semibold"
            :class="
              condition.status === 'met' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            "
          >
            {{ condition.status === 'met' ? '✓' : '✕' }}
          </div>

          <div class="text-sm text-neutral-800">
            {{ condition.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Next Actions -->
    <div class="mt-12 flex flex-wrap gap-4">
      <button
        @click="goToPrevious"
        :disabled="loading"
        class="rounded-md border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:border-neutral-200 disabled:text-neutral-400"
      >
        ← Previous
      </button>

      <button
        @click="interviewAgain"
        :disabled="loading"
        class="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-neutral-300"
      >
        {{ loading ? 'Starting...' : 'Interview Another Person' }}
      </button>

      <button
        @click="goToMasterDetail"
        :disabled="loading"
        class="rounded-md border border-neutral-900 px-6 py-2 text-sm font-medium text-neutral-900"
      >
        Return to Master Detail
      </button>
    </div>

    <div v-if="error" class="mt-4 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>
