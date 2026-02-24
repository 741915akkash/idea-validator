<script setup>
import { ref, onMounted, computed } from 'vue'
import { Target } from 'lucide-vue-next'
import { useQuizState } from '~/composables/useQuizState'

const quizState = useQuizState()
const quizStore = useQuizSessionStore()

const isClientReady = ref(false)

onMounted(() => {
  isClientReady.value = true
})

const showResume = computed(() => {
  return quizStore.hasQuiz && !quizStore.isCompleted
})

async function startNewQuiz() {
  const res = await $fetch('/api/quiz/lifecycle/start?force=true', {
    method: 'POST'
  })

  quizStore.startFreshQuiz(res.quiz_id)
  await quizStore.loadOverview(res.quiz_id)
  navigateTo('/quiz/overview')
}
</script>

<template>
  <nav
    class="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50"
  >
    <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

      <!-- Logo -->
      <div class="flex items-center gap-2">
        <Target class="w-6 h-6 text-emerald-600" />
        <span class="font-semibold text-lg tracking-tight text-slate-900">
          Idea Validator
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-6 text-sm">

        <NuxtLink
          to="/how-it-works"
          class="text-slate-700 hover:text-emerald-600 transition-colors"
        >
          How it works
        </NuxtLink>

        <NuxtLink
          to="/quiz/overview"
          class="text-slate-700 hover:text-emerald-600 transition-colors"
        >
          Overview
        </NuxtLink>

        <button
          @click="startNewQuiz"
          class="text-slate-700 hover:text-emerald-600 transition-colors"
        >
          Start new idea
        </button>

        <NuxtLink
          v-if="isClientReady && quizStore.hasQuiz"
          to="/quiz"
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Continue
        </NuxtLink>

        <!-- Primary CTA -->
        <NuxtLink
          v-else
          to="/signup"
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Start Validating
        </NuxtLink>

      </div>
    </div>
  </nav>
</template>