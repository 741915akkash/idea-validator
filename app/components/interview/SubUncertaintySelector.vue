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
      <h2 class="text-xl font-semibold text-neutral-900">Decomposition</h2>

      <p class="mt-2 text-sm text-neutral-600">Select the component you want to resolve first.</p>
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
            ? 'border-neutral-900 bg-neutral-50'
            : 'border-neutral-200 hover:border-neutral-400'
        ]"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="text-base font-semibold text-neutral-900">
              {{ sub.title }}
            </div>

            <div class="mt-2 text-sm text-neutral-600">
              {{ sub.description }}
            </div>
          </div>

          <div class="text-xs font-medium uppercase text-neutral-500">Impact: {{ sub.impact }}</div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-4 text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-6 text-sm text-neutral-600">
      Generating measurable goal and conditions…
    </div>

    <!-- Navigation -->
    <div class="mt-8 flex items-center gap-3">
      <button
        @click="handlePrevious"
        :disabled="loading"
        class="rounded-md border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 transition disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
      >
        ← Previous
      </button>

      <button
        @click="handleContinue"
        :disabled="!selectedId || loading"
        class="rounded-md bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
      >
        Continue →
      </button>
    </div>
  </div>
</template>
