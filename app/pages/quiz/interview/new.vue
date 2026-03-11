<script setup>
  import { onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  import { useInterviewSession } from '~/stores/interviewSession'
  import InterviewLayout from '~/components/interview/InterviewLayout.vue'
  import UncertaintyInput from '~/components/interview/UncertaintyInput.vue'
  import GoalConfirmation from '~/components/interview/GoalConfirmation.vue'
  import InterviewScreen from '~/components/interview/InterviewScreen.vue'
  import CompletionSummary from '~/components/interview/CompletionSummary.vue'

  const route = useRoute()
  const interview = useInterviewSession()

  onMounted(async () => {
    const quizId = route.query.quiz_id || null
    const subUncertaintyId = route.query.sub_uncertainty_id || null
    const fromMasterDetail = route.query.from_master_detail === '1'

    interview.startNewInterviewSession({
      quizId,
      disableGoalPrevious: fromMasterDetail
    })

    if (!subUncertaintyId) return

    try {
      const res = await $fetch('/api/sub_uncertainty/template', {
        query: { sub_uncertainty_id: subUncertaintyId }
      })

      const defaultGoalStatement = res.sub_uncertainty?.title || ''

      interview.setGoalDraft({
        selectedSub: res.sub_uncertainty,
        goal: {
          ...(res.goal || {}),
          statement: defaultGoalStatement
        },
        conditions: res.conditions || [],
        questions: res.questions || []
      })
    } catch {
      // Keep default uncertainty phase if template bootstrap fails.
    }
  })
</script>

<template>
  <main>
    <InterviewLayout>
      <UncertaintyInput v-if="interview.phase === 'uncertainty'" />
      <GoalConfirmation v-else-if="interview.phase === 'goal'" />
      <InterviewScreen v-else-if="interview.phase === 'resolve'" />
      <CompletionSummary v-else-if="interview.phase === 'complete'" />
    </InterviewLayout>
  </main>
</template>
