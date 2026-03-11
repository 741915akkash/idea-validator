<!-- app/components/interview/InterviewHeader.vue -->

<script setup>
  import { computed } from 'vue'
  import { useInterviewSession } from '@/stores/interviewSession'

  const interview = useInterviewSession()

  const hasConfidenceDelta = computed(() => {
    return (
      interview.confidenceBefore !== null &&
      interview.confidenceAfter !== null &&
      interview.phase === 'complete'
    )
  })

  const confidenceChange = computed(() => {
    if (!hasConfidenceDelta.value) return 0
    return interview.confidenceAfter - interview.confidenceBefore
  })

  const formattedChange = computed(() => {
    const diff = confidenceChange.value
    if (diff > 0) return `+${diff}`
    return `${diff}`
  })
</script>

<template>
  <div>
    <!-- Section Label -->
    <div class="text-lg font-medium uppercase tracking-wide text-neutral-500 sm:text-2xl">
      Deterministic Interview
    </div>

    <!-- Divider -->
    <div class="mt-4 border-t border-neutral-200 sm:mt-6"></div>
  </div>
</template>
