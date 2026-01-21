<script setup>
  import { computed } from 'vue'
  import { useQuizState } from '~/composables/useQuizState'

  const quizState = useQuizState()
  const quizStore = useQuizSessionStore() // auto-imported
  const isClientReady = ref(false)

  onMounted(() => {
    isClientReady.value = true
  })

  const showResume = computed(() => {
    return quizStore.hasQuiz && !quizStore.isCompleted
  })

  async function startNewQuiz() {
    const res = await $fetch('/api/quiz/start?force=true', {
      method: 'POST'
    })

    quizStore.startFreshQuiz(res.quiz_id)
    await quizStore.loadOverview(res.quiz_id)
    navigateTo('/quiz/overview')
  }
</script>

<template>
  <div class="min-hscreen flex flex-col">
    <header class="border-b border-emerald-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-emerald-700">Idea Validator</div>

        <nav class="flex items-center gap-4 text-sm">
          <NuxtLink to="/how-it-works" class="hover:text-emerald-700"> How it works </NuxtLink>

          <!-- ACTION -->
          <button @click="startNewQuiz" class="hover:text-emerald-700">Start new quiz</button>

          <NuxtLink to="/quiz/overview" class="hover:text-emerald-700"> Overview </NuxtLink>

          <NuxtLink
            v-if="isClientReady && quizStore.hasQuiz"
            to="/quiz"
            class="font-medium text-emerald-700 hover:underline"
          >
            Continue quiz
          </NuxtLink>
        </nav>
      </div>

      <div class="mt-3 h-[2px] w-full bg-emerald-500"></div>
    </header>

    <NuxtPage />
  </div>
</template>
