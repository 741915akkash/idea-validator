<script setup>
  import { onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'

  import { useInterviewSession } from '~/stores/interviewSession'
  import { useInterviewApi } from '~/composables/useInterviewApi'

  import InterviewLayout from '~/components/interview/InterviewLayout.vue'

  import UncertaintyInput from '~/components/interview/UncertaintyInput.vue'
  import GoalConfirmation from '~/components/interview/GoalConfirmation.vue'
  import InterviewScreen from '~/components/interview/InterviewScreen.vue'
  import CompletionSummary from '~/components/interview/CompletionSummary.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const interviewId = route.params.id

  const interview = useInterviewSession()
  const api = useInterviewApi()

  const loading = ref(true)
  const error = ref(null)

  /**
   * Phase → Component Map
   * Deterministic rendering based on store.phase
   */
  const phaseComponentMap = {
    uncertainty: UncertaintyInput,
    goal: GoalConfirmation,
    resolve: InterviewScreen,
    complete: CompletionSummary
  }

  const currentPhaseComponent = computed(() => {
    return phaseComponentMap[interview.phase] || UncertaintyInput
  })

  onMounted(async () => {
    if (!interviewId) {
      error.value = 'Invalid interview ID'
      loading.value = false
      return
    }

    try {
      const res = await api.fetchInterview({ interviewId })

      interview.initializeInterview(res)
    } catch (err) {
      error.value = 'Unable to load interview.'
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <main>
    <!-- Loading State -->
    <div v-if="loading" class="mx-auto max-w-4xl px-6 py-12 text-sm text-app-muted">
      Loading interview…
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mx-auto max-w-4xl px-6 py-12 text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Deterministic Interview Engine -->
    <InterviewLayout v-else>
      <component :is="currentPhaseComponent" />
    </InterviewLayout>
  </main>
</template>
