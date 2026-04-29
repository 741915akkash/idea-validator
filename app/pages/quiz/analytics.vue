<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const interviews = ref([])
  const conditions = ref([])
  const responses = ref([])
  const selectedInterview = ref(null)
  const subUncertainty = ref(null)
  const loadError = ref('')
  const loading = ref(false)
  const route = useRoute()
  const router = useRouter()
  const quizStore = useQuizSessionStore()

  onMounted(async () => {
    loading.value = true
    loadError.value = ''

    try {
      quizStore.hydrate()

      const quizId = route.query.quiz_id || quizStore.quizId || null
      const subUncertaintyId = route.query.sub_uncertainty_id || null

      if (!quizId) {
        loadError.value = 'Quiz not found.'
        return
      }

      if (!subUncertaintyId) {
        loadError.value = 'Sub-uncertainty not found.'
        return
      }

      const data = await $fetch('/api/interview/analytics', {
        query: {
          quiz_id: quizId,
          sub_uncertainty_id: subUncertaintyId
        }
      })

      subUncertainty.value = data.sub_uncertainty || null
      interviews.value = data.interviews || []
      conditions.value = data.conditions || []
      responses.value = data.responses || []
      selectedInterview.value = null
    } catch {
      loadError.value = 'Unable to load analytics.'
    } finally {
      loading.value = false
    }
  })

  function getResponse(interviewId, conditionId) {
    return responses.value.find(
      (r) =>
        String(r.interview_id) === String(interviewId) &&
        String(r.condition_id) === String(conditionId)
    )
  }

  function selectInterview(interview) {
    selectedInterview.value = interview
  }

  function conditionStatus(interviewId, conditionId) {
    const status = getResponse(interviewId, conditionId)?.status
    if (status === 'met') return { label: 'Met', className: 'bg-emerald-100 text-emerald-800' }
    if (status === 'failed') return { label: 'Not Met', className: 'bg-red-100 text-red-800' }
    return { label: 'Pending', className: 'bg-neutral-100 text-neutral-700' }
  }

  function matrixCell(interviewId, conditionId) {
    const status = getResponse(interviewId, conditionId)?.status

    if (status === 'met') {
      return { hasStatus: true, dotClass: 'bg-emerald-500' }
    }

    if (status === 'failed') {
      return { hasStatus: true, dotClass: 'bg-red-500' }
    }

    return { hasStatus: false, dotClass: '' }
  }

  function matrixPreview(interviewId, conditionId) {
    const response = getResponse(interviewId, conditionId)

    return {
      notes: response?.notes || 'No notes',
      evidence: response?.evidence_log || 'No evidence'
    }
  }

  function goBackToMasterDetail() {
    const quizId = route.query.quiz_id || quizStore.quizId
    const uncertaintyId = subUncertainty.value?.uncertainty_id || route.query.uncertainty_id
    const subUncertaintyId = subUncertainty.value?.id || route.query.sub_uncertainty_id

    const query = new URLSearchParams()
    if (quizId) query.set('quiz_id', String(quizId))
    if (uncertaintyId) query.set('uncertainty_id', String(uncertaintyId))
    if (subUncertaintyId) query.set('sub_uncertainty_id', String(subUncertaintyId))

    const queryString = query.toString()
    router.push(queryString ? `/quiz/master-detail?${queryString}` : '/quiz/master-detail')
  }

  const conditionStats = computed(() => {
    return conditions.value.map((condition) => {
      const met = responses.value.filter(
        (r) => r.condition_id === condition.id && r.status === 'met'
      ).length

      const failed = responses.value.filter(
        (r) => r.condition_id === condition.id && r.status === 'failed'
      ).length

      const total = met + failed
      let confidenceLabel = 'Low'
      let confidenceTone = 'text-red-700'

      if (total >= 6) {
        confidenceLabel = 'High'
        confidenceTone = 'text-emerald-700'
      } else if (total >= 3) {
        confidenceLabel = 'Medium'
        confidenceTone = 'text-amber-700'
      }

      return {
        ...condition,
        met,
        failed,
        total,
        confidenceLabel,
        confidenceTone,
        percent: total ? Math.round((met / total) * 100) : 0
      }
    })
  })

  const satisfiedConditions = computed(() => {
    return conditionStats.value.filter((c) => c.percent >= 70).length
  })

  const totalConditions = computed(() => conditions.value.length)
  const totalInterviews = computed(() => interviews.value.length)

  const verdict = computed(() => {
    if (!totalConditions.value) {
      return {
        icon: '⚠',
        title: 'NO DATA',
        className: 'border-amber-200 bg-amber-50 text-amber-900'
      }
    }

    const ratio = satisfiedConditions.value / totalConditions.value

    if (ratio >= 0.7) {
      return {
        icon: '✔',
        title: 'VALIDATED',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-900'
      }
    }

    if (ratio > 0) {
      return {
        icon: '⚠',
        title: 'PARTIALLY VALIDATED',
        className: 'border-amber-200 bg-amber-50 text-amber-900'
      }
    }

    return {
      icon: '✖',
      title: 'INVALIDATED',
      className: 'border-red-200 bg-red-50 text-red-900'
    }
  })
</script>

<template>
  <div class="mx-auto w-full max-w-3xl space-y-8 p-4 md:p-8">
    <!-- BACK -->
    <div>
      <button
        @click="goBackToMasterDetail"
        class="inline-flex items-center justify-center rounded-lg bg-[#E5E4E2] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#DAD8D4]"
      >
        Back to Master Detail
      </button>
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600"
    >
      Loading analytics...
    </div>

    <!-- ERROR -->
    <div
      v-else-if="loadError"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ loadError }}
    </div>

    <!-- SELECTED SUB UNCERTAINTY -->
    <div v-else-if="subUncertainty" class="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
      <div class="text-xs font-medium uppercase text-emerald-700">
        Selected Sub-uncertainty
      </div>

      <div class="mt-1 text-lg font-semibold text-emerald-900">
        {{ subUncertainty.title }}
      </div>

      <div v-if="subUncertainty.uncertainty_text" class="mt-1 text-sm text-emerald-800">
        {{ subUncertainty.uncertainty_text }}
      </div>
    </div>

    <div
      v-if="!loading && !loadError"
      class="rounded-lg border p-5"
      :class="verdict.className"
    >
      <div class="text-xs font-medium uppercase">Hypothesis Verdict</div>
      <div class="mt-2 text-2xl font-semibold">{{ verdict.icon }} {{ verdict.title }}</div>
      <div class="mt-2 text-sm">
        {{ satisfiedConditions }} / {{ totalConditions }} conditions satisfied across
        {{ totalInterviews }} interviews
      </div>
      <div class="mt-1 text-xs opacity-80">Rule: Validated if >=70% conditions met</div>
    </div>

    <!-- CONDITION STRENGTH -->
    <div v-if="!loading && !loadError" class="rounded-lg border bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-lg font-semibold">Condition Strength</h2>

      <div class="space-y-4">
        <div v-for="c in conditionStats" :key="c.id">
          <div class="mb-1 flex justify-between text-sm font-medium">
            <span>{{ c.description }}</span>
            <span class="text-emerald-700">{{ c.percent }}%</span>
          </div>

          <div class="h-2 w-full rounded-full bg-neutral-200">
            <div
              class="h-2 rounded-full bg-emerald-500 transition-all"
              :style="{ width: c.percent + '%' }"
            />
          </div>

          <div class="mt-1 text-xs text-neutral-500">
            {{ c.met }}/{{ totalInterviews }} interviews
          </div>

          <div class="mt-1 text-xs">
            <span class="text-neutral-500">Confidence:</span>
            <span class="ml-1 font-medium" :class="c.confidenceTone">
              {{ c.confidenceLabel }}
              <span v-if="c.confidenceLabel !== 'High'" class="font-normal text-neutral-500">
                ({{ c.total }} interview{{ c.total === 1 ? '' : 's' }})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- MATRIX -->
    <div v-if="!loading && !loadError" class="rounded-lg border bg-white shadow-sm">
      <div class="border-b px-6 py-4">
        <h2 class="text-lg font-semibold">Interview Matrix</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-6 py-3 text-left font-medium text-neutral-600">Interview</th>

              <th
                v-for="condition in conditions"
                :key="condition.id"
                class="px-6 py-3 text-left font-medium text-neutral-600"
              >
                {{ condition.description }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y">
            <tr
              v-for="interview in interviews"
              :key="interview.id"
              @click="selectInterview(interview)"
              class="cursor-pointer hover:bg-neutral-50"
            >
              <td class="px-6 py-3 font-medium text-neutral-900">
                <div>{{ interview.respondent_info || 'Interview' }}</div>
                <div class="mt-0.5 text-xs font-normal text-neutral-500">
                  {{ interview.started_at ? new Date(interview.started_at).toLocaleDateString() : '' }}
                </div>
              </td>

              <td
                v-for="condition in conditions"
                :key="condition.id"
                class="group relative h-10 min-w-[56px] p-0"
              >
                <div
                  v-if="matrixCell(interview.id, condition.id).hasStatus"
                  class="flex h-full w-full items-center justify-center"
                >
                  <span
                    class="inline-block h-4 w-4 rounded-full"
                    :class="matrixCell(interview.id, condition.id).dotClass"
                  />
                </div>
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-sm font-medium text-neutral-400"
                >
                  -
                </div>

                <div
                  class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-md border border-neutral-200 bg-white p-3 text-left text-xs text-neutral-700 shadow-lg group-hover:block"
                >
                  <div class="font-semibold text-neutral-900">Notes:</div>
                  <div class="mb-2 mt-0.5 whitespace-pre-wrap break-words">
                    {{ matrixPreview(interview.id, condition.id).notes }}
                  </div>

                  <div class="font-semibold text-neutral-900">Evidence:</div>
                  <div class="mt-0.5 whitespace-pre-wrap break-words">
                    {{ matrixPreview(interview.id, condition.id).evidence }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t px-6 py-3 text-xs text-neutral-600">
        <span class="mr-4 inline-flex items-center gap-1">
          <span class="inline-block h-3 w-3 rounded-full bg-emerald-500" /> met
        </span>
        <span class="mr-4 inline-flex items-center gap-1">
          <span class="inline-block h-3 w-3 rounded-full bg-red-500" /> failed
        </span>
        <span class="font-mono text-neutral-500">- = missing</span>
      </div>
    </div>

    <!-- INTERVIEW DETAIL -->
    <div v-if="selectedInterview" class="rounded-lg border bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold">Interview Detail</h2>

      <div class="space-y-5">
        <div class="text-base font-medium">
          {{ selectedInterview.respondent_info || 'Interview' }}
        </div>

        <div v-for="condition in conditions" :key="condition.id" class="border-t pt-4">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-medium">
              {{ condition.description }}
            </div>

            <span
              class="rounded-md px-2 py-1 text-xs font-medium"
              :class="conditionStatus(selectedInterview.id, condition.id).className"
            >
              {{ conditionStatus(selectedInterview.id, condition.id).label }}
            </span>
          </div>

          <div class="mt-2 text-sm text-neutral-600">
            {{ getResponse(selectedInterview.id, condition.id)?.notes || 'No notes' }}
          </div>

          <div class="mt-1 text-sm text-neutral-600">
            <span class="font-medium text-neutral-700">Evidence:</span>
            {{ getResponse(selectedInterview.id, condition.id)?.evidence_log || 'No evidence' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
