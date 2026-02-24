<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import Button from '~/components/ui/Button.vue'

  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  const interviewId = route.params.id

  const goals = ref([])
  const conditions = ref([])
  const questions = ref([])
  const currentQuestionIndex = ref(0)

  const loading = ref(true)
  const finishing = ref(false)
  const error = ref('')

  // derived
  const allConditionsAddressed = computed(
    () =>
      conditions.value.length > 0 &&
      conditions.value.every((c) => c.status === 'fulfilled' || c.status === 'skipped')
  )

  onMounted(async () => {
    if (!interviewId) return

    const res = await $fetch('/api/interview/get', {
      query: { interview_id: interviewId }
    })

    goals.value = res.goals
    conditions.value = res.conditions
    questions.value = res.questions

    loading.value = false
  })

  function markCondition(conditionId, status) {
    $fetch('/api/interview/condition/update', {
      method: 'POST',
      body: {
        condition_id: conditionId,
        status
      }
    })

    const c = conditions.value.find((c) => c.id === conditionId)
    if (c) c.status = status
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
    }
  }

  function prevQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
    }
  }

  async function finishInterview() {
    finishing.value = true

    await $fetch('/api/interview/finish', {
      method: 'POST',
      body: { interview_id: interviewId }
    })

    router.push(`/quiz/interviews?quiz_id=${quizStore.quizId}`)
  }
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-6xl">
      <h1 class="mb-2 text-2xl font-semibold">Interview</h1>
      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <div v-if="loading" class="text-base text-gray-600">Loading interview...</div>

      <div v-else class="grid grid-cols-3 gap-8">
        <!-- LEFT: Goals + Conditions -->
        <div class="space-y-6">
          <div v-for="goal in goals" :key="goal.id">
            <div class="mb-2 text-base font-semibold">
              {{ goal.text }}
            </div>

            <div
              v-for="c in conditions.filter((cond) => cond.goal_id === goal.id)"
              :key="c.id"
              class="mb-2 flex items-center justify-between rounded border px-3 py-2 text-base"
            >
              <span>{{ c.text }}</span>

              <div class="flex gap-2">
                <button class="text-xs text-emerald-700" @click="markCondition(c.id, 'fulfilled')">
                  ✔
                </button>
                <button class="text-xs text-gray-500" @click="markCondition(c.id, 'skipped')">
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CENTER: Question Area -->
        <div class="col-span-1">
          <div v-if="questions.length > 0">
            <div class="mb-4 text-base font-medium">Question {{ currentQuestionIndex + 1 }}</div>

            <div class="mb-6 rounded border px-4 py-3 text-base">
              {{ questions[currentQuestionIndex].text }}
            </div>

            <div class="flex gap-4">
              <Button @click="prevQuestion" :disabled="currentQuestionIndex === 0">
                Previous
              </Button>

              <Button
                @click="nextQuestion"
                :disabled="currentQuestionIndex === questions.length - 1"
              >
                Next
              </Button>
            </div>
          </div>

          <div v-else class="text-base text-gray-600">No questions yet.</div>
        </div>

        <!-- RIGHT: Notes Placeholder -->
        <div>
          <div class="mb-2 text-base font-medium">Private Notes</div>

          <textarea
            class="w-full rounded border px-3 py-2 text-base"
            rows="10"
            placeholder="Write notes here..."
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-10 flex items-center justify-between">
        <div class="text-base text-gray-600">
          <span v-if="allConditionsAddressed" class="text-emerald-700">
            All conditions addressed.
          </span>
          <span v-else> Some conditions still unmet. </span>
        </div>

        <Button @click="finishInterview" :disabled="finishing"> Finish Interview </Button>
      </div>
    </div>
  </main>
</template>
