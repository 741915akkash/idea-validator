<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Target, LayoutDashboard, Rocket, BookOpen, MessagesSquare, PanelLeftRightDashed, PanelLeftRightDashedIcon, Columns3 } from 'lucide-vue-next'
  import { useQuizSessionStore } from '~/stores/quizSession'

  const props = defineProps({
    showBrand: {
      type: Boolean,
      default: true
    }
  })

  const quizStore = useQuizSessionStore()
  const route = useRoute()

  const isClientReady = ref(false)
  const quizzes = ref([])

  onMounted(async () => {
    quizStore.hydrate()
    isClientReady.value = true

    try {
      quizzes.value = await $fetch('/api/quiz/quizzes')
    } catch {
      quizzes.value = []
    }
  })

  function quizLabel(q) {
    return q.revision_number === 0 ? q.name : `${q.name} — Revision ${q.revision_number}`
  }

  async function switchQuiz(id) {
    if (!id || id === quizStore.quizId) return

    quizStore.loaded = false
    quizStore.setQuizId(id)
    await quizStore.loadOverview(id)

    if (!route.path.startsWith('/quiz/overview')) {
      navigateTo('/quiz/overview')
    }
  }

  async function startNewQuiz() {
    const res = await $fetch('/api/quiz/lifecycle/start?force=true', {
      method: 'POST'
    })

    quizStore.startFreshQuiz(res.quiz_id)
    await quizStore.loadOverview(res.quiz_id)

    navigateTo('/quiz/overview')
  }

  /* Active route detection */

  const isOverview = computed(() => route.path.startsWith('/quiz/overview'))

  const isInterviews = computed(() => route.path.startsWith('/quiz/interviews'))

  const isHowItWorks = computed(() => route.path.startsWith('/how-it-works'))
</script>

<template>
  <nav class="flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 pt-10 pb-6">
    <!-- Logo -->
    <NuxtLink v-if="props.showBrand" to="/" class="flex items-center gap-2">
      <Target class="h-6 w-6 text-emerald-600 md:h-8 md:w-8" />
      <span class="text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
        Idea Validator
      </span>
    </NuxtLink>

    <!-- QUIZ SELECTOR -->
    <div v-if="isClientReady && quizzes.length" class="mt-6">
      <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
        Quiz
      </label>

      <select
        class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        :value="quizStore.quizId"
        @change="switchQuiz($event.target.value)"
      >
        <option v-for="q in quizzes" :key="q.id" :value="q.id">
          {{ quizLabel(q) || 'Untitled quiz' }}
        </option>
      </select>
    </div>

    <!-- MAIN SECTION -->
    <div class="mt-8">
      <div class="mb-2 text-xs uppercase tracking-wide text-neutral-500">Main</div>

      <div class="flex flex-col gap-1 text-sm">
        <!-- Overview -->
        <NuxtLink
          to="/quiz/overview"
          class="flex items-center gap-2 rounded-lg px-3 py-2 transition"
          :class="
            isOverview
              ? 'bg-emerald-50 font-medium text-emerald-700'
              : 'text-slate-700 hover:bg-slate-100'
          "
        >
          <LayoutDashboard class="h-4 w-4" />
          Overview
        </NuxtLink>

        <NuxtLink
          :to="quizStore.quizId ? `/quiz/interviews?quiz_id=${quizStore.quizId}` : '/quiz/interviews'"
          class="flex items-center gap-2 rounded-lg px-3 py-2 transition"
          :class="
            isInterviews
              ? 'bg-emerald-50 font-medium text-emerald-700'
              : 'text-slate-700 hover:bg-slate-100'
          "
        >
          <MessagesSquare class="h-4 w-4" />
          Interviews
        </NuxtLink>

        <!-- Master Detail -->
        <NuxtLink
          :to="
            quizStore.quizId
              ? `/quiz/master-detail?quiz_id=${quizStore.quizId}`
              : '/quiz/master-detail'
          "
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100"
        >
          <Columns3 class="h-4 w-4" />
          Master Detail
        </NuxtLink>

        <!-- Start new idea -->
        <button
          @click="startNewQuiz"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100"
        >
          <Rocket class="h-4 w-4" />
          Start new idea
        </button>
      </div>
    </div>

    <!-- LEARN SECTION -->
    <div class="mt-6">
      <div class="mb-2 text-xs uppercase tracking-wide text-neutral-500">Learn</div>

      <NuxtLink
        to="/how-it-works"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
        :class="
          isHowItWorks
            ? 'bg-emerald-50 font-medium text-emerald-700'
            : 'text-slate-700 hover:bg-slate-100'
        "
      >
        <BookOpen class="h-4 w-4" />
        How it works
      </NuxtLink>
    </div>

    <!-- PRIMARY CTA -->
    <div class="mt-8">
      <NuxtLink
        v-if="isClientReady && quizStore.hasQuiz"
        to="/quiz"
        class="block w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-700"
      >
        Continue
      </NuxtLink>

      <NuxtLink
        v-else
        to="/signup-login"
        class="block w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-700"
      >
        Start Validating
      </NuxtLink>
    </div>
  </nav>
</template>
