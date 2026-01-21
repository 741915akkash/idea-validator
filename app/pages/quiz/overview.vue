<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import Button from '~/components/ui/Button.vue'

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()
  const quizzes = ref([])
  const renaming = ref(false)
  const nameDraft = ref('')
  const isClientReady = ref(false)

  const currentQuiz = computed(() => quizzes.value.find((q) => q.id === quizStore.quizId))

  // 📝 checkpoint → hasNotes
  const checkpointHasNotes = ref({})

  const scoreError = ref('')

  async function handleScoreClick() {
    try {
      await $fetch('/api/quiz/score', {
        method: 'POST',
        body: { quiz_id: quizStore.quizId }
      })

      router.push(`/quiz/score?quiz_id=${quizStore.quizId}`)
    } catch (e) {
      scoreError.value = e.statusMessage || 'Unable to score'
    }
  }

  function quizLabel(q) {
    return q.revision_number === 0 ? q.name : `${q.name} — Revision ${q.revision_number}`
  }

  onMounted(async () => {
    isClientReady.value = true

    await loadQuizzes()

    if (quizStore.quizId) {
      await quizStore.loadOverview(quizStore.quizId)
    }

    // 1️⃣ Ensure quiz exists
    if (!quizStore.quizId) {
      const res = await $fetch('/api/quiz/start', { method: 'POST' })
      quizStore.setQuizId(res.quiz_id)
    }

    // 2️⃣ Force refresh overview every time
    quizStore.loaded = false
    await quizStore.loadOverview(quizStore.quizId)

    // 4️⃣ Fetch notes summary (checkpoint-level)
    const notesRes = await $fetch('/api/quiz/notes/summary', {
      query: { quiz_id: quizStore.quizId }
    })

    /*
    notesRes.checkpoints = [1, 3, 7]
  */

    checkpointHasNotes.value = {}

    for (const cp of notesRes.checkpoints) {
      checkpointHasNotes.value[cp] = true
    }
  })

  async function goToCheckpoint(checkpointNumber) {
    await $fetch('/api/quiz/set-current-checkpoint', {
      method: 'POST',
      body: {
        quiz_id: quizStore.quizId,
        checkpoint: checkpointNumber
      }
    })

    router.push(`/quiz/${checkpointNumber}`)
  }

  async function loadQuizzes() {
    quizzes.value = await $fetch('/api/quiz/quizzes')
  }

  async function switchQuiz(id) {
    if (id === quizStore.quizId) return

    // IMPORTANT: clear old overview state
    quizStore.loaded = false

    quizStore.setQuizId(id)

    // Force reload overview for new quiz
    await quizStore.loadOverview(id)
  }

  async function saveRename() {
    if (!currentQuiz.value) return

    await $fetch('/api/quiz/rename-quiz', {
      method: 'POST',
      body: {
        quiz_id: currentQuiz.value.id,
        name: nameDraft.value
      }
    })

    currentQuiz.value.name = nameDraft.value
    renaming.value = false
  }
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-2 text-2xl font-semibold">Quiz overview</h1>

      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <div class="mb-6 flex items-center justify-between">
        <!-- Quiz title + rename -->
        <div v-if="currentQuiz" class="group flex items-center gap-2">
          <!-- Normal (view mode) -->
          <div
            v-if="!renaming"
            class="flex cursor-pointer items-center gap-2"
            @click="
              () => {
                renaming = true
                nameDraft = currentQuiz.name
              }
            "
          >
            <h1 class="text-2xl font-semibold">
              {{ currentQuiz.name || 'Untitled quiz' }}
              {{
                currentQuiz && currentQuiz.revision_number > 0
                  ? `Revision ${currentQuiz.revision_number}`
                  : ''
              }}
            </h1>

            <!-- Pencil icon (hover only) -->
            <span class="opacity-0 transition-opacity group-hover:opacity-100" title="Rename">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </span>
          </div>

          <!-- Rename mode -->
          <div v-else class="flex items-center gap-2">
            <input
              v-model="nameDraft"
              class="rounded border px-2 py-1 text-sm"
              placeholder="Quiz name"
            />
            <button @click="saveRename" class="text-sm text-emerald-700">Save</button>
            <button @click="renaming = false" class="text-sm text-gray-500">Cancel</button>
          </div>
        </div>

        <!-- Quiz selector -->
        <div class="mb-4" v-if="isClientReady">
          <select
            class="rounded border px-3 py-2"
            :value="quizStore.quizId"
            @change="switchQuiz($event.target.value)"
          >
            <option v-for="q in quizzes" :key="q.id" :value="q.id">
              {{ quizLabel(q) || 'Untitled quiz' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Checkpoints list -->
      <section v-if="quizStore.checkpoints.length" class="space-y-4">
        <div
          v-for="cp in quizStore.checkpoints"
          :key="cp.checkpoint"
          class="flex items-center justify-between rounded border px-4 py-3"
        >
          <div>
            <div class="flex items-center gap-2 text-sm font-medium">
              <span>Checkpoint {{ cp.checkpoint }}</span>

              <!-- 📝 Notes indicator -->
              <span
                v-if="checkpointHasNotes[cp.checkpoint]"
                class="inline-flex select-none items-center rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                title="This checkpoint has notes"
              >
                has notes
              </span>
            </div>

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
      <div class="mt-10 space-y-2">
        <!-- Error message -->
        <div
          v-if="scoreError"
          class="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700"
        >
          {{ scoreError }}
        </div>

        <div class="flex items-center gap-4">
          <!-- Score button (before completion) -->
          <Button
            v-if="quizStore.checkpoints.length && !quizStore.isCompleted"
            @click="handleScoreClick()"
          >
            Score My Idea
          </Button>

          <!-- View Score button (after completion) -->
          <NuxtLink
            v-else-if="quizStore.isCompleted"
            :to="`/quiz/score?quiz_id=${quizStore.quizId}`"
            class="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            View Score
          </NuxtLink>

          <NuxtLink to="/" class="text-sm text-gray-600 hover:underline"> Exit </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
