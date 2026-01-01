<script setup>
  import { onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  const checkpoint = Number(route.params.checkpoint)
  const quizId = quizStore.quizId

  // Safety: no quiz → back to overview
  if (!quizId) {
    router.replace('/quiz/overview')
  }

  // Load checkpoint state
  const {
    data: state,
    pending,
    refresh
  } = await useFetch('/api/quiz/state', {
    query: {
      quiz_id: quizId,
      checkpoint
    }
  })

  // Questions derived from backend
  const questions = computed(() => state.value?.questions || [])

  // Unanswered = no selected_option
  const unansweredCount = computed(() => questions.value.filter((q) => !q.selected_option).length)

  // Save answer (DB is source of truth)
  const saveAnswer = async (questionId, optionKey) => {
    await $fetch('/api/quiz/answer', {
      method: 'POST',
      body: {
        quiz_id: quizId,
        question_id: questionId,
        selected_option: optionKey
      }
    })

    // Update UI immediately (no refetch)
    const q = questions.value.find((q) => q.id === questionId)
    if (q) q.selected_option = optionKey
  }

  // Complete checkpoint
  const completeCheckpoint = async () => {
    await $fetch('/api/quiz/complete-checkpoint', {
      method: 'POST',
      body: {
        quiz_id: quizId,
        checkpoint
      }
    })

    // Ask backend for lifecycle state
    const lifecycle = await $fetch('/api/quiz/state', {
      query: { quiz_id: quizId }
    })

    if (lifecycle.status === 'READY_TO_SCORE') {
      await $fetch('/api/quiz/score', {
        method: 'POST',
        body: { quiz_id: quizId }
      })
      router.replace(`/result/${quizId}`)
      return
    }

    router.replace(`/quiz/${checkpoint + 1}?quiz_id=${quizId}`)
  }
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-10">
    <!-- Header -->
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Checkpoint {{ checkpoint }}</h1>
        <p class="text-sm text-gray-600">{{ unansweredCount }} unanswered</p>
      </div>

      <NuxtLink to="/quiz/overview" class="text-sm text-emerald-700 hover:underline">
        Back to overview
      </NuxtLink>
    </header>

    <!-- Loading -->
    <p v-if="pending" class="text-sm text-gray-500">Loading questions…</p>

    <!-- Questions -->
    <section v-else class="space-y-6">
      <div v-for="q in questions" :key="q.id" class="rounded border p-4">
        <p class="mb-3 font-medium">
          {{ q.question_text }}
        </p>

        <div class="space-y-2">
          <button
            v-for="(opt, key) in q.option_map"
            :key="key"
            @click="saveAnswer(q.id, key)"
            class="block w-full rounded border px-4 py-2 text-left"
            :class="{
              'border-emerald-600 bg-emerald-50': q.selected_option === key
            }"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Continue -->
    <button class="mt-8 rounded bg-emerald-600 px-6 py-3 text-white" @click="completeCheckpoint">
      {{ unansweredCount > 0 ? 'Continue with unanswered questions' : 'Complete checkpoint' }}
    </button>
  </main>
</template>
