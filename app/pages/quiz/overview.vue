<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import Button from '~/components/ui/Button.vue'

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  onMounted(async () => {
    if (!quizStore.quizId) {
      const res = await $fetch('/api/quiz/start', { method: 'POST' })

      quizStore.setQuizId(res.quiz_id)
    }
    console.log('quizId', quizStore.quizId)
    console.log('checkpoints', quizStore.checkpoints)


    await quizStore.loadOverview(quizStore.quizId)

    if (quizStore.isCompleted) {
      router.replace(`/result/${quizStore.quizId}`)
    }
  })

  function goToCheckpoint(checkpointNumber) {
    router.push(`/quiz/${checkpointNumber}?quiz_id=${quizStore.quizId}`)
  }
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-2 text-2xl font-semibold">Quiz overview</h1>

      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <!-- Checkpoints list -->
      <section v-if="quizStore.checkpoints.length" class="space-y-4">
        <div
          v-for="cp in quizStore.checkpoints"
          :key="cp.checkpoint"
          class="flex items-center justify-between rounded border px-4 py-3"
        >
          <div>
            <div class="text-sm font-medium">Checkpoint {{ cp.checkpoint }}</div>

            <div class="text-xs text-gray-600">
              <span v-if="cp.unanswered > 0"> {{ cp.unanswered }} unanswered </span>
              <span v-else> All questions answered </span>
            </div>
          </div>

          <button
            class="text-sm text-emerald-700 hover:underline"
            @click="goToCheckpoint(cp.checkpoint)"
          >
            Review
          </button>
        </div>
      </section>

      <!-- Footer actions -->
      <div class="mt-10 flex items-center gap-4">
        <Button
          v-if="quizStore.isFullyAnswered && quizStore.checkpoints.length"
          :to="`/quiz/${quizStore.checkpoints[0].checkpoint}?quiz_id=${quizStore.quizId}`"
        >
          Review answers
        </Button>

        <NuxtLink to="/" class="text-sm text-gray-600 hover:underline"> Exit </NuxtLink>
      </div>
    </div>
  </main>
</template>
