<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import Button from '~/components/ui/Button.vue'

  const router = useRouter()
  const quizStore = useQuizSessionStore()

  const interviews = ref([])
  const loading = ref(true)

  onMounted(async () => {
    if (!quizStore.quizId) return

    interviews.value = await $fetch('/api/interview/list', {
      query: { quiz_id: quizStore.quizId }
    })

    loading.value = false
  })

  function startNewInterview() {
    router.push(`/quiz/interview/new?quiz_id=${quizStore.quizId}`)
  }

  function openInterview(id) {
    router.push(`/quiz/interview/${id}?quiz_id=${quizStore.quizId}`)
  }
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-2 text-2xl font-semibold">Interviews</h1>
      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <div v-if="loading" class="text-base text-gray-600">Loading interviews...</div>

      <div v-else>
        <!-- If none -->
        <div v-if="interviews.length === 0" class="mb-6 text-base text-gray-600">
          No interviews yet.
        </div>

        <!-- Interview List -->
        <div
          v-for="interview in interviews"
          :key="interview.id"
          class="mb-4 flex items-center justify-between rounded border px-4 py-3"
        >
          <div>
            <div class="text-base font-medium">Interview</div>

            <div class="text-xs text-gray-600">
              Started:
              {{ new Date(interview.started_at).toLocaleDateString() }}
            </div>

            <div class="text-xs">
              <span v-if="interview.finished_at" class="text-emerald-700"> Completed </span>

              <span v-else class="text-amber-600"> In Progress </span>
            </div>
          </div>

          <button
            class="text-base text-emerald-700 hover:underline"
            @click="openInterview(interview.id)"
          >
            {{ interview.finished_at ? 'View' : 'Resume' }}
          </button>
        </div>

        <!-- Start New -->
        <div class="mt-8">
          <Button @click="startNewInterview"> Start New Interview </Button>
        </div>

        <div class="mt-6">
          <NuxtLink :to="`/quiz/overview`" class="text-base text-gray-600 hover:underline">
            Back to Overview
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
