<!-- app/components/interview/InterviewLayout.vue -->

<script setup>
  import { useInterviewSession } from '@/stores/interviewSession'
  import InterviewHeader from '@/components/interview/InterviewHeader.vue'
  import InterviewPhaseStepper from '@/components/interview/InterviewPhaseStepper.vue'

  const interview = useInterviewSession()
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Centered Container -->
    <div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <!-- Header -->
      <InterviewHeader />

      <!-- Phase Stepper -->
      <div class="mt-6 sm:mt-8">
        <InterviewPhaseStepper :current-phase="interview.phase" />
      </div>

      <!-- Main Phase Container -->
      <div class="mt-6 sm:mt-10">
        <div class="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
