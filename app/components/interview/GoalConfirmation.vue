<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useInterviewSession } from '@/stores/interviewSession'
  import { useInterviewApi } from '@/composables/useInterviewApi'

  const interview = useInterviewSession()
  const api = useInterviewApi()
  const router = useRouter()
  const { credits, fetchCredits } = useCredits()

  const loading = ref(false)
  const generating = ref(false)
  const error = ref(null)
  const generateCost = 10
  const creditsLeft = computed(() =>
    Number.isFinite(Number(credits.value?.balance)) ? Number(credits.value.balance) : null
  )
  const creditsHint = computed(() =>
    creditsLeft.value == null ? 'Credits unavailable' : `${creditsLeft.value} credits left`
  )

  function toEditable(conditions, questions) {
    return (conditions || []).map((c) => ({
      id: c.id,
      description: c.description,
      questions: (questions || []).filter((q) => q.condition_id === c.id).map((q) => q.text)
    }))
  }

  // Local editable copies
  const editableGoal = ref(interview.goal?.statement || '')
  const editableConditions = ref(toEditable(interview.conditions, interview.interviewQuestions))

  function addCondition() {
    editableConditions.value.push({
      id: `temp-${Date.now()}`,
      description: '',
      questions: []
    })
  }

  function removeCondition(id) {
    editableConditions.value = editableConditions.value.filter((c) => c.id !== id)
  }

  function addQuestion(condition) {
    condition.questions.push('')
  }

  function removeQuestion(condition, index) {
    condition.questions.splice(index, 1)
  }

  function handlePrevious() {
    if (isPreviousDisabled.value) return
    interview.goToPreviousPhase()
  }

  const isPreviousDisabled = computed(() => {
    return loading.value || generating.value || interview.disableGoalPrevious
  })

  onMounted(async () => {
    await fetchCredits()
  })

  async function generateConditionsAndQuestions() {
    if (!editableGoal.value.trim() || generating.value || loading.value) return

    generating.value = true
    error.value = null

    try {
      const res = await api.createStructure({
        subUncertaintyId: interview.selectedSub.id,
        goal: editableGoal.value.trim()
      })

      interview.setGoalDraft({
        selectedSub: interview.selectedSub,
        goal: { id: res.goal_id, statement: editableGoal.value.trim() },
        conditions: res.conditions || [],
        questions: res.questions || []
      })
      editableConditions.value = toEditable(res.conditions, res.questions)
    } catch (err) {
      error.value = 'Unable to generate conditions and questions.'
    } finally {
      generating.value = false
      await fetchCredits(true)
    }
  }

  async function confirmAndStart() {
    if (!editableGoal.value.trim()) return

    loading.value = true
    error.value = null

    try {
      // 1️⃣ Update goal text
      await $fetch('/api/sub_uncertainty/update-goal', {
        method: 'POST',
        body: {
          goal_id: interview.goal.id,
          statement: editableGoal.value.trim()
        }
      })

      // 2️⃣ Replace conditions entirely (clean overwrite)
      await $fetch('/api/sub_uncertainty/replace-conditions', {
        method: 'POST',
        body: {
          goal_id: interview.goal.id,
          conditions: editableConditions.value.map((c) => ({
            description: c.description,
            questions: c.questions
          }))
        }
      })

      // 3️⃣ Start execution
      const res = await api.startInterview({
        quizId: interview.quizId,
        subUncertaintyId: interview.selectedSub.id
      })

      router.push(`/quiz/interview/${res.interview_id}`)
    } catch (err) {
      error.value = 'Unable to start interview.'
    } finally {
      loading.value = false
      await fetchCredits(true)
    }
  }
</script>

<template>
  <div class="max-w-3xl">
    <!-- Title -->
    <div>
      <h2 class="text-xl font-semibold text-app-text">Review Goal Structure</h2>

      <p class="mt-2 text-sm text-app-muted">
        Edit goal and required conditions before starting deterministic evaluation.
      </p>
    </div>

    <!-- Goal -->
    <div class="mt-8">
      <div class="mb-2 text-sm font-medium text-app-muted">Goal</div>

      <textarea
        v-model="editableGoal"
        rows="3"
        class="w-full rounded-md border border-app-border px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      ></textarea>
    </div>

    <!-- Conditions Header -->
    <div class="mt-10 flex items-center justify-between">
      <div class="text-sm font-medium text-app-muted">Conditions (Binary & Observable)</div>

      <div class="flex items-center gap-3">
        <!-- Generate -->
        <button
          @click="generateConditionsAndQuestions"
          :disabled="generating || loading"
          class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:bg-neutral-300"
        >
          {{ generating ? 'Generating…' : 'Generate Conditions + Questions' }}
        </button>
        <span class="text-xs text-app-muted"
          >Costs {{ generateCost }} credits • {{ creditsHint }}</span
        >

        <!-- Add -->
        <button
          @click="addCondition"
          class="rounded-md border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/10"
        >
          + Add Condition
        </button>
      </div>
    </div>

    <!-- Conditions -->
    <div class="mt-6 space-y-8">
      <div
        v-for="(condition, i) in editableConditions"
        :key="condition.id"
        class="rounded-lg border border-emerald-500/20 p-6"
      >
        <div class="space-y-4">
          <!-- Condition Row -->
          <div class="grid grid-cols-[140px_1fr_80px] items-start gap-4">
            <div class="pt-2 text-sm font-semibold">Condition {{ i + 1 }}</div>

            <textarea
              v-model="condition.description"
              rows="2"
              class="w-full rounded-md border border-app-border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Condition description"
            ></textarea>

            <button
              @click="removeCondition(condition.id)"
              class="pt-2 text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>

          <!-- Questions -->
          <div
            v-for="(q, index) in condition.questions"
            :key="index"
            class="grid grid-cols-[140px_1fr_80px] items-center gap-4"
          >
            <div class="text-xs font-medium">Question {{ index + 1 }}</div>

            <input
              v-model="condition.questions[index]"
              class="w-full rounded-md border border-app-border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Question"
            />

            <button
              @click="removeQuestion(condition, index)"
              class="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>

          <!-- Add Question Row -->
          <div class="grid grid-cols-[140px_1fr_80px] items-center gap-4">
            <div></div>

            <button
              @click="addQuestion(condition)"
              class="text-left text-xs font-medium text-emerald-500 hover:underline"
            >
              + Add Question
            </button>

            <div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notice -->
    <div
      class="mt-8 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-900"
    >
      All conditions must be resolved individually. The goal is met only if required conditions are
      satisfied.
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-6 text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Navigation -->
    <div class="mt-10 flex items-center gap-3">
      <button
        @click="handlePrevious"
        :disabled="isPreviousDisabled"
        class="rounded-md border border-app-border px-6 py-2 text-sm font-medium text-app-muted transition disabled:cursor-not-allowed disabled:border-app-border disabled:text-neutral-400"
      >
        ← Previous
      </button>

      <button
        @click="confirmAndStart"
        :disabled="loading || generating"
        class="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:bg-neutral-300"
      >
        {{ loading ? 'Starting...' : 'Start Resolution →' }}
      </button>
    </div>
  </div>
</template>
