<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'

  const router = useRouter()
  const quizStore = useQuizSessionStore()

  const interviews = ref([])
  const quizName = ref('')
  const loading = ref(true)

  const renamingId = ref(null)
  const nameDraft = ref('')
  const cloningInterviewId = ref(null)
  const actionError = ref(null)

  const selectedFilter = ref('all')

  onMounted(async () => {
    if (!quizStore.quizId) {
      loading.value = false
      return
    }

    try {
      const [interviewRows, quiz] = await Promise.all([
        $fetch('/api/interview/list', {
          query: { quiz_id: quizStore.quizId }
        }),
        $fetch('/api/quiz/by-id', {
          query: { quiz_id: quizStore.quizId }
        })
      ])

      interviews.value = interviewRows
      quizName.value = quiz?.name || ''
    } finally {
      loading.value = false
    }
  })

  function openInterview(id) {
    router.push(`/quiz/interview/${id}?quiz_id=${quizStore.quizId}`)
  }

  function startRename(interview) {
    renamingId.value = interview.id
    nameDraft.value = interview.respondent_info || ''
  }

  async function saveRename(interview) {
    await $fetch('/api/interview/update-respondent', {
      method: 'POST',
      body: {
        interview_id: interview.id,
        respondent_info: nameDraft.value
      }
    })

    interview.respondent_info = nameDraft.value
    renamingId.value = null
  }

  async function interviewAgainFromCard(sourceInterviewId) {
    if (cloningInterviewId.value) return

    cloningInterviewId.value = sourceInterviewId
    actionError.value = null

    try {
      const payload = await $fetch('/api/interview/get', {
        query: { interview_id: sourceInterviewId }
      })

      const quizId = quizStore.quizId || payload?.interview?.quiz_id
      const subUncertaintyId = payload?.sub_uncertainty?.id
      const goalId = payload?.goal?.id

      if (!quizId || !subUncertaintyId || !goalId) {
        throw new Error('Missing interview context')
      }

      await $fetch('/api/sub_uncertainty/update-goal', {
        method: 'POST',
        body: {
          goal_id: goalId,
          statement: payload.goal?.statement || ''
        }
      })

      const conditionsPayload = (payload.conditions || []).map((condition) => ({
        description: condition.description,
        questions: (payload.questions || [])
          .filter((q) => String(q.condition_id) === String(condition.id))
          .map((q) => q.text)
      }))

      await $fetch('/api/sub_uncertainty/replace-conditions', {
        method: 'POST',
        body: {
          goal_id: goalId,
          conditions: conditionsPayload
        }
      })

      const res = await $fetch('/api/interview/start', {
        method: 'POST',
        body: {
          quiz_id: quizId,
          sub_uncertainty_id: subUncertaintyId
        }
      })

      router.push(`/quiz/interview/${res.interview_id}?quiz_id=${quizId}`)
    } catch (err) {
      actionError.value = 'Unable to start another interview from this card.'
    } finally {
      cloningInterviewId.value = null
    }
  }

  const filteredInterviews = computed(() => {
    if (selectedFilter.value === 'all') return interviews.value

    if (selectedFilter.value === 'completed') {
      return interviews.value.filter((i) => i.finished_at)
    }

    if (selectedFilter.value === 'in_progress') {
      return interviews.value.filter((i) => !i.finished_at)
    }
  })

  const groupedInterviews = computed(() => {
    const groups = {}

    for (const interview of filteredInterviews.value) {
      const key = interview.sub_uncertainty_id || 'default'

      if (!groups[key]) {
        groups[key] = {
          subUncertaintyId: key,
          subUncertainty: interview.sub_uncertainty || 'Sub-uncertainty',
          interviews: []
        }
      }

      groups[key].interviews.push(interview)
    }

    return Object.values(groups).map((group) => ({
      ...group,
      interviews: group.interviews.sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
    }))
  })
</script>

<template>
  <main class="px-6 py-12">
    <div class="mx-auto max-w-2xl">
      <!-- Page Heading -->
      <h1 class="mb-2 text-2xl font-semibold">Interviews</h1>
      <div class="mb-8 h-1 w-16 bg-emerald-500"></div>

      <!-- Filter -->
      <div class="mb-6">
        <select
          v-model="selectedFilter"
          class="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-base text-gray-600">Loading interviews...</div>

      <div v-else>
        <div v-if="actionError" class="mb-4 text-sm text-red-600">
          {{ actionError }}
        </div>

        <!-- Empty State -->
        <div
          v-if="interviews.length === 0"
          class="mb-6 rounded border border-gray-300 bg-gray-50 px-4 py-4 text-base text-gray-700"
        >
          No interviews yet.
        </div>

        <!-- Interview List -->
        <div v-for="group in groupedInterviews" :key="group.subUncertaintyId" class="mb-10">
          <!-- GROUP HEADER -->
          <div class="flex items-center justify-between border-l-4 border-emerald-500 pl-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ group.subUncertainty }}
              </h2>

              <div class="text-xs text-gray-500">{{ group.interviews.length }} interviews</div>
            </div>

            <button
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              :disabled="!!cloningInterviewId"
              @click="interviewAgainFromCard(group.interviews[0].id)"
            >
              Interview Another Person
            </button>
          </div>

          <!-- DIVIDER -->
          <div class="mt-4 border-t"></div>

          <!-- INTERVIEW ROWS -->
          <div class="divide-y">
            <div
              v-for="interview in group.interviews"
              :key="interview.id"
              class="flex items-center justify-between py-4"
            >
              <!-- LEFT -->
              <div class="flex-1">
                <!-- TITLE + RENAME -->
                <div class="group flex items-center gap-2">
                  <template v-if="renamingId !== interview.id">
                    <div class="font-medium text-gray-900">
                      {{ interview.respondent_info || 'Interview' }}
                    </div>

                    <span
                      class="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                      title="Rename"
                      @click="startRename(interview)"
                    >
                      ✏️
                    </span>
                  </template>

                  <template v-else>
                    <input
                      v-model="nameDraft"
                      class="rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="Respondent name, role, company..."
                    />

                    <button class="text-sm text-emerald-700" @click="saveRename(interview)">
                      Save
                    </button>

                    <button class="text-sm text-gray-500" @click="renamingId = null">Cancel</button>
                  </template>
                </div>

                <!-- META -->
                <div class="mt-1 text-xs text-gray-500">
                  Started {{ new Date(interview.started_at).toLocaleDateString() }}
                </div>

                <!-- STATUS -->
                <div class="mt-1 text-xs font-medium">
                  <span v-if="interview.finished_at" class="text-emerald-700"> Completed </span>

                  <span v-else class="text-amber-600"> In Progress </span>
                </div>
              </div>

              <!-- RIGHT ACTIONS -->
              <div class="flex items-center gap-4">
                <button
                  class="text-sm font-medium text-emerald-700 hover:underline"
                  @click="openInterview(interview.id)"
                >
                  {{ interview.finished_at ? 'View' : 'Resume' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Back -->
        <div class="mt-8">
          <NuxtLink
            to="/quiz/overview"
            class="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
          >
            Back to Overview
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
