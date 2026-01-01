<script setup>
import { useQuizState } from '~/composables/useQuizState'

const quizState = useQuizState()

const showResume = computed(() => {
  return quizState.hasActiveQuiz === true
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <header class="px-6 py-4 border-b border-emerald-200">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-emerald-700">
          Idea Validator
        </div>

        <nav class="flex items-center gap-4 text-sm">
          <NuxtLink to="/how-it-works" class="hover:text-emerald-700">
            How it works
          </NuxtLink>

          <NuxtLink to="/how-it-works" class="hover:text-emerald-700">
            Start new quiz
          </NuxtLink>

          <NuxtLink
            v-if="showResume"
            to="/quiz"
            class="text-emerald-700 font-medium hover:underline"
          >
            Resume
          </NuxtLink>
        </nav>
      </div>

      <!-- subtle accent strip -->
      <div class="mt-3 h-[2px] w-full bg-emerald-500"></div>
    </header>

    <NuxtPage />
  </div>
</template>
