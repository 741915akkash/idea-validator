<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizSessionStore } from '~/stores/quizSession'
import Button from '~/components/ui/Button.vue'

const router = useRouter()
const quizStore = useQuizSessionStore()

const goalInput = ref('')
const selectedGoals = ref([])
const loading = ref(false)
const error = ref('')

const templates = [
  'Identify the main blocker preventing progress',
  'Identify who makes the decision',
  'Identify what users are doing instead',
  'Identify constraints preventing action',
  'Identify the moment users consider changing'
]

function addGoal(text) {
  if (!text) return
  if (!selectedGoals.value.includes(text)) {
    selectedGoals.value.push(text)
  }
}

function removeGoal(goal) {
  selectedGoals.value = selectedGoals.value.filter(g => g !== goal)
}

async function startInterview() {
  if (!quizStore.quizId) return
  if (selectedGoals.value.length === 0) {
    error.value = 'Add at least one goal.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await $fetch('/api/interview/start', {
      method: 'POST',
      body: {
        quiz_id: quizStore.quizId,
        goals: selectedGoals.value
      }
    })

    router.push(`/quiz/interview/${res.interview_id}?quiz_id=${quizStore.quizId}`)
  } catch (e) {
    error.value = e.statusMessage || 'Unable to start interview'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">

      <h1 class="mb-2 text-2xl font-semibold">Start New Interview</h1>
      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <!-- Custom Goal Input -->
      <div class="mb-6">
        <label class="mb-2 block text-base font-medium">
          What do you want to learn?
        </label>

        <div class="flex gap-2">
          <input
            v-model="goalInput"
            class="flex-1 rounded border px-3 py-2 text-base"
            placeholder="Type a goal..."
          />
          <Button @click="addGoal(goalInput); goalInput = ''">
            Add
          </Button>
        </div>
      </div>

      <!-- Templates -->
      <div class="mb-6">
        <div class="mb-2 text-base font-medium">Or choose a template</div>

        <div class="space-y-2">
          <button
            v-for="template in templates"
            :key="template"
            class="block w-full rounded border px-3 py-2 text-left text-base hover:bg-gray-50"
            @click="addGoal(template)"
          >
            {{ template }}
          </button>
        </div>
      </div>

      <!-- Selected Goals -->
      <div v-if="selectedGoals.length > 0" class="mb-6">
        <div class="mb-2 text-base font-medium">Selected Goals</div>

        <div class="space-y-2">
          <div
            v-for="goal in selectedGoals"
            :key="goal"
            class="flex items-center justify-between rounded border px-3 py-2 text-base"
          >
            <span>{{ goal }}</span>
            <button
              class="text-xs text-red-600 hover:underline"
              @click="removeGoal(goal)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-700"
      >
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <Button @click="startInterview" :disabled="loading">
          {{ loading ? 'Starting...' : 'Start Interview' }}
        </Button>

        <NuxtLink
          to="/quiz/interviews"
          class="text-base text-gray-600 hover:underline"
        >
          Cancel
        </NuxtLink>
      </div>

    </div>
  </main>
</template>
