<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Target, Menu, X } from 'lucide-vue-next'
  import { useQuizState } from '~/composables/useQuizState'

  const quizState = useQuizState()
  const quizStore = useQuizSessionStore()

  const isClientReady = ref(false)
  const mobileMenuOpen = ref(false)

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
  <nav class="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <Target class="h-6 w-6 text-emerald-600" />
        <span class="text-lg font-semibold tracking-tight text-slate-900"> Idea Validator </span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <div class="hidden items-center gap-6 text-sm md:flex">
        <NuxtLink
          to="/how-it-works"
          class="text-slate-700 transition-colors hover:text-emerald-600"
        >
          How it works
        </NuxtLink>

        <NuxtLink
          to="/quiz/overview"
          class="text-slate-700 transition-colors hover:text-emerald-600"
        >
          Overview
        </NuxtLink>

        <button
          @click="startNewQuiz"
          class="text-slate-700 transition-colors hover:text-emerald-600"
        >
          Start new idea
        </button>

        <NuxtLink
          v-if="isClientReady && quizStore.hasQuiz"
          to="/quiz"
          class="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Continue
        </NuxtLink>

        <NuxtLink
          v-else
          to="/signup"
          class="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Start Validating
        </NuxtLink>
      </div>

      <!-- Mobile Hamburger -->
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-slate-700 md:hidden">
        <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
        <X v-else class="h-6 w-6" />
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="border-t border-slate-200 bg-white md:hidden">
      <div class="flex flex-col gap-4 px-6 py-4 text-sm">
        <NuxtLink
          to="/how-it-works"
          class="text-slate-700 hover:text-emerald-600"
          @click="mobileMenuOpen = false"
        >
          How it works
        </NuxtLink>

        <NuxtLink
          to="/quiz/overview"
          class="text-slate-700 hover:text-emerald-600"
          @click="mobileMenuOpen = false"
        >
          Overview
        </NuxtLink>

        <button @click="startNewQuiz" class="text-left text-slate-700 hover:text-emerald-600">
          Start new idea
        </button>

        <NuxtLink
          v-if="isClientReady && quizStore.hasQuiz"
          to="/quiz"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-center font-medium text-white"
          @click="mobileMenuOpen = false"
        >
          Continue
        </NuxtLink>

        <NuxtLink
          v-else
          to="/signup"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-center font-medium text-white"
          @click="mobileMenuOpen = false"
        >
          Start Validating
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
