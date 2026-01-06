<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import Button from '~/components/ui/Button.vue'

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  // 📝 checkpoint → hasNotes
  const checkpointHasNotes = ref({})

  const scoreError = ref('')

  function handleScoreClick() {
    if (!quizStore.isFullyAnswered) {
      scoreError.value = 'Answer all questions before scoring'
      return
    }

    router.push(`/quiz/score?quiz_id=${quizStore.quizId}`)
  }

  onMounted(async () => {
    // 1️⃣ Ensure quiz exists
    if (!quizStore.quizId) {
      const res = await $fetch('/api/quiz/start', { method: 'POST' })
      quizStore.setQuizId(res.quiz_id)
    }

    // 2️⃣ Force refresh overview every time
    quizStore.loaded = false
    await quizStore.loadOverview(quizStore.quizId)

    // 3️⃣ Redirect if completed
    if (quizStore.isCompleted) {
      const res = await $fetch('/api/quiz/result', {
        query: { quiz_id: quizStore.quizId }
      })

      if (res) {
        router.replace(`/result/${quizStore.quizId}`)
      }
    }

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
        <p v-if="scoreError" class="text-sm text-amber-600">
          {{ scoreError }}
        </p>

        <div class="flex items-center gap-4">
          <!-- Score button -->
          <Button
            v-if="quizStore.checkpoints.length && !quizStore.isCompleted"
            @click="handleScoreClick"
          >
            Score My Idea
          </Button>

          <NuxtLink to="/" class="text-sm text-gray-600 hover:underline"> Exit </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
