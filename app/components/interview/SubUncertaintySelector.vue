<!-- app/components/interview/SubUncertaintySelector.vue -->

<script setup>
  import { ref } from 'vue'
  import { useInterviewSession } from '@/stores/interviewSession'
  import { useInterviewApi } from '@/composables/useInterviewApi'

  const interview = useInterviewSession()
  const api = useInterviewApi()

  const selectedId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  function selectCard(id) {
    if (loading.value) return
    selectedId.value = id
  }

  function handlePrevious() {
    if (loading.value) return
    interview.goToPreviousPhase()
  }

  async function handleContinue() {
    if (!selectedId.value || loading.value) return

    loading.value = true
    error.value = null

    try {
      const selectedSub = interview.subUncertainties.find((s) => s.id === selectedId.value)

      // 1️⃣ Create template structure
      const structureRes = await api.createStructure({
        subUncertaintyId: selectedSub.id,
        goal: selectedSub.title
      })

      // 2️⃣ Store template + transition phase via store action
      interview.setGoalDraft({
        selectedSub,
        goal: { id: structureRes.goal_id, statement: selectedSub.title },
        conditions: structureRes.conditions,
        questions: []
      })
    } catch (err) {
      error.value = 'Unable to generate goal structure.'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div>
    <!-- Title -->
    <div>
      <h2 class="text-xl font-semibold text-app-text">Decomposition</h2>

      <p class="mt-2 text-sm text-app-muted">Select the component you want to resolve first.</p>
    </div>

    <!-- Cards -->
    <div class="mt-8 space-y-4">
      <div
        v-for="sub in interview.subUncertainties"
        :key="sub.id"
        @click="selectCard(sub.id)"
        :class="[
          'cursor-pointer rounded-lg border p-5 transition',
          selectedId === sub.id
            ? 'border-app-border bg-app-hover'
            : 'border-app-border hover:border-app-border'
        ]"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="text-base font-semibold text-app-text">
              {{ sub.title }}
            </div>

            <div class="mt-2 text-sm text-app-muted">
              {{ sub.description }}
            </div>
          </div>

          <div class="text-xs font-medium uppercase text-app-muted">Impact: {{ sub.impact }}</div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-4 text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-6 text-sm text-app-muted">
      Generating measurable goal and conditions…
    </div>

    <!-- Navigation -->
    <div class="mt-8 flex items-center gap-3">
      <button
        @click="handlePrevious"
        :disabled="loading"
        class="rounded-md border border-app-border px-6 py-2 text-sm font-medium text-app-muted transition disabled:cursor-not-allowed disabled:border-app-border disabled:text-neutral-400"
      >
        ← Previous
      </button>

      <button
        @click="handleContinue"
        :disabled="!selectedId || loading"
        class="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-app-muted"
      >
        Continue →
      </button>
    </div>
  </div>
</template>
