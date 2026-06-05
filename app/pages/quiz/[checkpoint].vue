<script setup>
  import { onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import { ref, watch } from 'vue'
  import AsqDropdown from '~/components/quiz/AsqDropdown.vue'
  import QuestionNotes from '~/components/quiz/QuestionNotes.vue'
  import NotesPanel from '~/components/quiz/NotesPanel.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  const checkpoint = Number(route.params.checkpoint)
  const quizId = quizStore.quizId

  // Safety: no quiz → back to overview
  if (!quizId) {
    router.replace('/quiz/overview')
  }

  // Guard invalid dynamic route params (e.g. /quiz/interview-templates).
  if (!Number.isInteger(checkpoint) || checkpoint < 1 || checkpoint > 9) {
    router.replace('/quiz/overview')
  }

  // Load checkpoint state
  const {
    data: state,
    pending,
    refresh
  } = await useFetch('/api/quiz/lifecycle/state', {
    query: {
      quiz_id: quizId,
      checkpoint
    }
  })

  // Questions derived from backend
  const questions = ref([])
  watch(
    () => state.value?.questions,
    (newQuestions) => {
      if (newQuestions && questions.value.length === 0) {
        questions.value = newQuestions.map((q) => ({ ...q }))
      }
    },
    { immediate: true }
  )

  // Unanswered = no selected_option
  const unansweredCount = computed(() => questions.value.filter((q) => !q.selected_option).length)

  const isMobile = ref(false)

  onMounted(async () => {
    // 1️⃣ detect mobile
    isMobile.value = window.innerWidth < 768

    const quizMeta = await $fetch('/api/quiz/by-id', {
      query: { quiz_id: quizId }
    }).catch(() => null)
    if (quizMeta?.workspace_id) {
      quizStore.setCurrentWorkspace({ id: quizMeta.workspace_id })
    }

    // 2️⃣ auto-open notes for questions that already have saved notes
    const res = await $fetch('/api/quiz/notes/summary', {
      query: { quiz_id: quizId }
    })

    for (const qId of res.question_ids) {
      notesOpen.value[qId] = true
    }
  })

  const asqOpen = ref({})
  const notesOpen = ref({})

  const toggleAsq = (id) => {
    asqOpen.value[id] = !asqOpen.value[id]
  }

  const toggleNotes = (id) => {
    notesOpen.value[id] = !notesOpen.value[id]
  }

  // TODO: replace this once backend exposes quiz status
  const isReadOnly = computed(() => false)

  // Save answer (DB is source of truth)
  const saveAnswer = async (questionId, optionKey) => {
    const qIndex = questions.value.findIndex((q) => q.id === questionId)
    if (qIndex === -1) return

    const current = questions.value[qIndex].selected_option

    let nextValue

    if (current === null) {
      // nothing selected → select
      nextValue = optionKey
    } else if (current === optionKey) {
      // same option → unselect
      nextValue = null
    } else {
      // different option → switch
      nextValue = optionKey
    }

    await $fetch('/api/quiz/answers/answer', {
      method: 'POST',
      body: {
        quiz_id: quizId,
        question_id: questionId,
        selected_option: nextValue
      }
    })

    // Update UI immediately (no refetch)
    const index = questions.value.findIndex((q) => q.id === questionId)
    if (index !== -1) {
      questions.value[index] = {
        ...questions.value[index],
        selected_option: nextValue
      }
    }
  }

  // Complete checkpoint
  const completeCheckpoint = async () => {
    await $fetch('/api/quiz/checkpoints/complete-checkpoint', {
      method: 'POST',
      body: {
        quiz_id: quizId,
        checkpoint
      }
    })

    // Final checkpoint should always return to overview.
    if (checkpoint === 9) {
      await navigateTo('/quiz/overview')
      return
    }

    // Ask backend for lifecycle state
    const lifecycle = await $fetch('/api/quiz/lifecycle/state', {
      query: { quiz_id: quizId }
    })

    if (lifecycle.status === 'READY_TO_SCORE') {
      await $fetch('/api/quiz/score/score', {
        method: 'POST',
        body: { quiz_id: quizId }
      })
      router.replace(`/result/${quizId}`)
      return
    }

    router.replace(`/quiz/${lifecycle.current_checkpoint}?quiz_id=${quizId}`)
  }
</script>

<template>
  <main class="mx-auto w-full max-w-3xl px-6 py-10">
    <!-- Header -->
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Checkpoint {{ checkpoint }}</h1>
        <p class="text-base text-gray-600">{{ unansweredCount }} unanswered</p>
      </div>

      <button
        type="button"
        @click="navigateTo('/quiz/overview')"
        class="inline-flex items-center justify-center rounded-lg bg-[#E5E4E2] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#DAD8D4]"
      >
        Back to Overview
      </button>
    </header>

    <!-- Loading -->
    <p v-show="pending" class="text-base text-gray-500">Loading questions…</p>

    <!-- Questions -->
    <section v-show="!pending" class="space-y-6">
      <div
        v-for="q in questions"
        :key="q.id"
        class="relative w-full max-w-xl rounded border border-neutral-300 bg-white p-4"
      >
        <div>
          <div>
            <p class="mb-3 break-words font-medium">
              {{ q.question_text }}
            </p>

            <!-- Main options -->
            <div class="space-y-2">
              <button
                v-for="(opt, key) in q.option_map"
                :key="key"
                @click="saveAnswer(q.id, key)"
                class="box-border block w-full rounded border px-4 py-2 text-left"
                :class="{
                  'border-emerald-600 bg-emerald-50': q.selected_option === key
                }"
              >
                {{ opt.label }}
              </button>
            </div>

            <!-- Action buttons -->
            <div class="mt-3 flex gap-4 text-base text-gray-500">
              <button @click="toggleAsq(q.id)">ASQs</button>
              <button @click="toggleNotes(q.id)">Notes</button>
            </div>

            <!-- ASQs -->
            <div v-show="asqOpen[q.id]" class="mt-3">
              <AsqDropdown :quizId="quizId" :questionId="q.id" />
            </div>

            <!-- NOTES (MOBILE INLINE ONLY) -->
            <div v-if="isMobile" v-show="notesOpen[q.id]" class="mt-3">
              <QuestionNotes :quiz-id="quizId" :question-id="q.id" :read-only="isReadOnly" />
            </div>
          </div>

          <!-- NOTES (DESKTOP FLOATING PANEL) -->
          <div v-if="!isMobile && notesOpen[q.id]" class="absolute left-full top-0 ml-6 w-[360px]">
            <NotesPanel :quiz-id="quizId" :question-id="q.id" :read-only="isReadOnly" />
          </div>
        </div>
      </div>
    </section>

    <!-- Continue -->
    <button class="mt-8 rounded bg-emerald-600 px-6 py-3 text-white" @click="completeCheckpoint">
      {{ unansweredCount > 0 ? 'Continue' : 'Complete checkpoint' }}
    </button>
  </main>
</template>
