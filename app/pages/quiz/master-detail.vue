<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const router = useRouter()
  const route = useRoute()
  const quizStore = useQuizSessionStore()
  const user = useUser()

  const loading = ref(true)
  const loadingSubs = ref(false)
  const loadingInterviews = ref(false)
  const startingAnother = ref(false)
  const showUpgradeModal = ref(false)
  const error = ref(null)

  const uncertainties = ref([])
  const subUncertainties = ref([])
  const interviews = ref([])

  const selectedUncertainty = ref(null)
  const selectedSub = ref(null)
  const isPaidTier = computed(() => {
    const tier = String(user.value?.plan_tier || 'free')
      .trim()
      .toLowerCase()
    return tier === 'growth' || tier === 'founder'
  })

  function isFreeformTemplateUncertainty(item) {
    return String(item?.text || '').trim() === '__FREEFORM_TEMPLATE__'
  }

  function isFreeformSubUncertainty(item) {
    return String(item?.title || '').trim().toUpperCase() === 'FREEFORM'
  }

  function isFreeformInterview(item) {
    return String(item?.sub_uncertainty || '').trim().toUpperCase() === 'FREEFORM'
  }

  /* ---------------- MOBILE NAVIGATION ---------------- */

  const mobileView = ref('uncertainties')
  // 'uncertainties' | 'subs' | 'interviews'

  function isMobile() {
    return window.innerWidth < 768
  }

  /* ---------------- LOAD UNCERTAINTIES ---------------- */

  onMounted(async () => {
    if (!quizStore.quizId) {
      loading.value = false
      return
    }

    try {
      const rows = await $fetch('/api/uncertainty/list', {
        query: { quiz_id: quizStore.quizId }
      })
      uncertainties.value = rows.filter((u) => !isFreeformTemplateUncertainty(u))

      const queryUncertaintyId = route.query.uncertainty_id
      const querySubUncertaintyId = route.query.sub_uncertainty_id

      if (queryUncertaintyId) {
        const matchedUncertainty = uncertainties.value.find(
          (u) => String(u.id) === String(queryUncertaintyId)
        )

        if (matchedUncertainty) {
          await selectUncertainty(matchedUncertainty)

          if (querySubUncertaintyId) {
            const matchedSub = subUncertainties.value.find(
              (sub) => String(sub.id) === String(querySubUncertaintyId)
            )
            if (matchedSub) {
              await selectSub(matchedSub)
            }
          }
        }
      }
    } catch (e) {
      error.value = 'Unable to load uncertainties.'
    } finally {
      loading.value = false
    }
  })

  /* ---------------- SELECT UNCERTAINTY ---------------- */

  async function selectUncertainty(u) {
    selectedUncertainty.value = u
    selectedSub.value = null
    subUncertainties.value = []
    interviews.value = []

    loadingSubs.value = true

    if (isMobile()) {
      mobileView.value = 'subs'
    }

    try {
      const rows = await $fetch('/api/sub_uncertainty/list', {
        query: { uncertainty_id: u.id }
      })
      subUncertainties.value = rows.filter((sub) => !isFreeformSubUncertainty(sub))
    } finally {
      loadingSubs.value = false
    }
  }

  /* ---------------- SELECT SUB UNCERTAINTY ---------------- */

  async function selectSub(sub) {
    selectedSub.value = sub

    loadingInterviews.value = true

    if (isMobile()) {
      mobileView.value = 'interviews'
    }

    try {
      if (!quizStore.quizId) {
        interviews.value = []
        return
      }

      const rows = await $fetch('/api/interview/list', {
        query: {
          quiz_id: quizStore.quizId,
          sub_uncertainty_id: sub.id
        }
      })
      interviews.value = rows.filter((interview) => !isFreeformInterview(interview))
    } finally {
      loadingInterviews.value = false
    }
  }

  /* ---------------- START NEW INTERVIEW ---------------- */

  async function interviewAnotherPerson() {
    if (!selectedSub.value || startingAnother.value) return

    startingAnother.value = true
    error.value = null

    try {
      const quizId = quizStore.quizId

      if (!quizId) {
        throw new Error('Missing quiz')
      }

      if (interviews.value.length > 0) {
        const sourceInterviewId = interviews.value[0].id

        const payload = await $fetch('/api/interview/get', {
          query: { interview_id: sourceInterviewId }
        })

        const goalId = payload?.goal?.id
        const subUncertaintyId = payload?.sub_uncertainty?.id

        if (!goalId || !subUncertaintyId) {
          throw new Error('Missing interview template')
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
        return
      }

      router.push(
        `/quiz/interview/new?quiz_id=${quizId}&sub_uncertainty_id=${selectedSub.value.id}&from_master_detail=1`
      )
    } catch {
      error.value = 'Unable to start another interview.'
    } finally {
      startingAnother.value = false
    }
  }

  /* ---------------- OPEN INTERVIEW ---------------- */

  function openInterview(id) {
    router.push(`/quiz/interview/${id}?quiz_id=${quizStore.quizId}`)
  }

  function openAnalytics() {
    if (!selectedSub.value) return
    router.push(
      `/quiz/analytics?quiz_id=${quizStore.quizId}&sub_uncertainty_id=${selectedSub.value.id}`
    )
  }

  function startNewInterview() {
    if (!quizStore.quizId) return
    if (!isPaidTier.value) {
      showUpgradeModal.value = true
      return
    }
    router.push(`/quiz/interview/new?quiz_id=${quizStore.quizId}`)
  }

  function closeUpgradeModal() {
    showUpgradeModal.value = false
  }
</script>

<template>
  <div class="flex h-screen justify-center bg-neutral-50">
    <div class="flex h-full w-full max-w-7xl flex-col bg-white shadow-sm">
      <div class="flex min-h-0 flex-1">
        <!-- ================= DESKTOP LAYOUT ================= -->

        <!-- UNCERTAINTIES -->
        <div class="hidden w-80 flex-col border-r md:flex">
          <div class="flex min-h-[104px] flex-col border-b px-4 py-3">
            <span class="font-semibold">Uncertainties</span>
            <div class="mt-3 min-h-[30px]">
              <button
                @click="startNewInterview"
                class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Resolve New Uncertainties
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div
              v-for="u in uncertainties"
              :key="u.id"
              @click="selectUncertainty(u)"
              class="cursor-pointer border-b px-4 py-3 hover:bg-gray-50"
              :class="{ 'bg-emerald-50': selectedUncertainty?.id === u.id }"
            >
              <div class="font-medium">{{ u.text }}</div>
              <div class="mt-1 text-xs text-gray-500">
                {{ u.created_at ? new Date(u.created_at).toLocaleDateString() : '' }}
              </div>
            </div>
          </div>
        </div>

        <!-- SUB UNCERTAINTIES -->
        <div class="hidden w-96 flex-col border-r md:flex">
          <div class="flex min-h-[104px] flex-col border-b px-4 py-3">
            <div class="font-semibold">Sub-uncertainties</div>
            <div class="mt-3 min-h-[30px]"></div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="!selectedUncertainty" class="p-4 text-sm text-gray-500">
              Select an uncertainty
            </div>

            <div v-else-if="loadingSubs" class="p-4 text-sm text-gray-500">
              Loading sub-uncertainties...
            </div>

            <div
              v-for="sub in subUncertainties"
              :key="sub.id"
              @click="selectSub(sub)"
              class="cursor-pointer border-b px-4 py-3 hover:bg-gray-50"
              :class="{ 'bg-emerald-50': selectedSub?.id === sub.id }"
            >
              <div class="font-medium">{{ sub.title }}</div>
              <div class="mt-1 text-xs text-gray-500">
                {{ sub.interview_count || 0 }} interviews
              </div>
            </div>
          </div>
        </div>

        <!-- INTERVIEWS -->
        <div class="hidden flex-1 flex-col md:flex">
          <div class="flex min-h-[104px] flex-col border-b px-4 py-3">
            <span class="font-semibold">Interviews</span>
            <div class="mt-3 min-h-[30px]">
              <div v-if="selectedSub" class="flex items-center gap-2">
                <button
                  @click="interviewAnotherPerson"
                  :disabled="startingAnother"
                  class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:bg-neutral-300"
                >
                  {{ startingAnother ? 'Starting...' : 'Interview Another Person' }}
                </button>

                <button
                  @click="openAnalytics"
                  class="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div
              v-for="interview in interviews"
              :key="interview.id"
              class="flex items-center justify-between border-b px-4 py-3"
            >
              <div>
                <div class="font-medium text-gray-900">
                  {{ interview.respondent_info || 'Interview' }}
                </div>

                <div class="mt-1 text-xs text-gray-500">
                  {{ new Date(interview.started_at).toLocaleDateString() }}
                </div>

                <div class="mt-1 text-xs">
                  <span v-if="interview.finished_at" class="font-medium text-emerald-700">
                    Completed
                  </span>
                  <span v-else class="font-medium text-amber-600"> In Progress </span>
                </div>
              </div>

              <button
                class="text-sm text-emerald-600 hover:underline"
                @click="openInterview(interview.id)"
              >
                {{ interview.finished_at ? 'View' : 'Resume' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ================= MOBILE LAYOUT ================= -->

        <div class="flex w-full flex-col md:hidden">
          <!-- UNCERTAINTIES -->
          <div v-if="mobileView === 'uncertainties'">
            <div class="border-b px-4 py-3">
              <span class="font-semibold">Uncertainties</span>
              <button
                @click="startNewInterview"
                class="mt-3 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Resolve New Uncertainties
              </button>
            </div>

            <div
              v-for="u in uncertainties"
              :key="u.id"
              @click="selectUncertainty(u)"
              class="border-b px-4 py-3"
            >
              <div class="font-medium">
                {{ u.text }}
              </div>

              <div class="mt-1 text-xs text-gray-500">
                {{ u.created_at ? new Date(u.created_at).toLocaleDateString() : '' }}
              </div>
            </div>
          </div>

          <!-- SUB UNCERTAINTIES -->
          <div v-if="mobileView === 'subs'">
            <div class="flex items-center border-b px-4 py-3">
              <button class="mr-3 text-sm text-emerald-600" @click="mobileView = 'uncertainties'">
                ← Back
              </button>

              <span class="font-semibold">Sub-uncertainties</span>
            </div>

            <div
              v-for="sub in subUncertainties"
              :key="sub.id"
              @click="selectSub(sub)"
              class="border-b px-4 py-3"
            >
              <div class="font-medium">
                {{ sub.title }}
              </div>

              <div class="mt-1 text-xs text-gray-500">
                {{ sub.interview_count || 0 }} interviews
              </div>
            </div>
          </div>

          <!-- INTERVIEWS -->
          <div v-if="mobileView === 'interviews'">
            <div class="border-b px-4 py-3">
              <div class="flex items-center">
                <button class="mr-3 text-sm text-emerald-600" @click="mobileView = 'subs'">
                  ← Back
                </button>

                <span class="font-semibold">Interviews</span>
              </div>

              <div v-if="selectedSub" class="mt-3 flex items-center gap-2">
                <button
                  @click="openAnalytics"
                  class="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Analytics
                </button>

                <button
                  @click="interviewAnotherPerson"
                  :disabled="startingAnother"
                  class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:bg-neutral-300"
                >
                  {{ startingAnother ? 'Starting...' : 'Interview Another Person' }}
                </button>
              </div>
            </div>

            <div v-for="interview in interviews" :key="interview.id" class="border-b px-4 py-3">
              <div class="font-medium text-gray-900">
                {{ interview.respondent_info || 'Interview' }}
              </div>

              <div class="mt-1 text-xs text-gray-500">
                {{ new Date(interview.started_at).toLocaleDateString() }}
              </div>

              <div class="mt-1 text-xs">
                <span v-if="interview.finished_at" class="font-medium text-emerald-700">
                  Completed
                </span>

                <span v-else class="font-medium text-amber-600"> In Progress </span>
              </div>

              <button
                class="mt-2 text-sm text-emerald-600 hover:underline"
                @click="openInterview(interview.id)"
              >
                {{ interview.finished_at ? 'View' : 'Resume' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showUpgradeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50" @click="closeUpgradeModal" />

      <div class="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
        <h2 class="text-lg font-semibold text-slate-900">Upgrade required</h2>
        <p class="mt-2 text-sm text-slate-600">
          Move to a paid tier to access Resolve New Uncertainties.
        </p>

        <div class="mt-5 flex items-center justify-end gap-2">
          <button
            class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="closeUpgradeModal"
          >
            Not now
          </button>
          <NuxtLink
            to="/general/pricing"
            class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            @click="closeUpgradeModal"
          >
            View pricing
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
