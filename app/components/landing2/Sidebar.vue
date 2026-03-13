<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Target } from 'lucide-vue-next'
  import { useQuizState } from '~/composables/useQuizState'
  import { useQuizSessionStore } from '~/stores/quizSession'

  const quizState = useQuizState()
  const quizStore = useQuizSessionStore()
  const route = useRoute()

  const isClientReady = ref(false)

  onMounted(() => {
    isClientReady.value = true
  })

  async function startNewQuiz() {
    const res = await $fetch('/api/quiz/lifecycle/start?force=true', {
      method: 'POST'
    })

    quizStore.startFreshQuiz(res.quiz_id)
    await quizStore.loadOverview(res.quiz_id)

    navigateTo('/quiz/overview')
  }

  /* Active route detection */

  const isOverview = computed(() => route.path.startsWith('/quiz'))

  const isHowItWorks = computed(() => route.path.startsWith('/how-it-works'))
</script>

<template>
  <nav class="flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-6">
    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center gap-2">
      <Target class="h-6 w-6 text-emerald-600" />
      <span class="text-lg font-semibold tracking-tight text-slate-900"> Idea Validator </span>
    </NuxtLink>

    <!-- PRIMARY CTA -->
    <div class="mt-6">
      <NuxtLink
        v-if="isClientReady && quizStore.hasQuiz"
        to="/quiz"
        class="block w-full rounded-lg bg-emerald-600 px-4 py-2 text-center font-medium text-white transition hover:bg-emerald-700"
      >
        Continue
      </NuxtLink>

      <NuxtLink
        v-else
        to="/signup"
        class="block w-full rounded-lg bg-emerald-600 px-4 py-2 text-center font-medium text-white transition hover:bg-emerald-700"
      >
        Start Validating
      </NuxtLink>
    </div>

    <!-- MAIN SECTION -->
    <div class="mt-8">
      <div class="mb-2 text-xs uppercase tracking-wide text-neutral-500">Main</div>

      <div class="flex flex-col gap-1 text-sm">
        <!-- Overview -->
        <NuxtLink
          to="/quiz/overview"
          class="rounded-lg px-3 py-2 transition"
          :class="
            isOverview
              ? 'bg-emerald-50 font-medium text-emerald-700'
              : 'text-slate-700 hover:bg-slate-100'
          "
        >
          Overview
        </NuxtLink>

        <!-- Start new idea -->
        <button
          @click="startNewQuiz"
          class="rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100"
        >
          Start new idea
        </button>
      </div>
    </div>

    <!-- LEARN SECTION -->
    <div class="mt-6">
      <div class="mb-2 text-xs uppercase tracking-wide text-neutral-500">Learn</div>

      <NuxtLink
        to="/how-it-works"
        class="rounded-lg px-3 py-2 text-sm transition"
        :class="
          isHowItWorks
            ? 'bg-emerald-50 font-medium text-emerald-700'
            : 'text-slate-700 hover:bg-slate-100'
        "
      >
        How it works
      </NuxtLink>
    </div>
  </nav>
</template>
