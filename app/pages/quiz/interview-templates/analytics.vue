<template>
  <div class="min-h-screen bg-white p-6">
    <!-- HEADER -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">
          {{ analytics?.template?.title || 'Analytics' }}
        </h1>

        <p v-if="selectedVersion !== null" class="mt-1 text-sm font-medium text-slate-600">
          Version {{ selectedVersion }}
        </p>

        <p class="mt-2 text-sm text-slate-500">
          {{ analytics?.template?.description }}
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div class="text-xs font-medium uppercase tracking-wide text-slate-500">
          Total Interviews
        </div>

        <div class="mt-1 text-3xl font-semibold text-slate-900">
          {{ analytics?.total_interviews || 0 }}
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
    >
      Loading analytics...
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- QUESTIONS -->
    <div v-else class="space-y-6">
      <div
        v-for="(question, index) in analytics.questions"
        :key="index"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
      >
        <div class="grid grid-cols-[56px_1fr] gap-4">
          <!-- LEFT COLUMN -->
          <div class="flex justify-center">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-700"
            >
              {{ index + 1 }}
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="space-y-4">
            <div>
              <div class="flex items-start justify-between gap-4">
                <h2 class="text-base font-semibold text-slate-900 md:text-lg">
                  {{ question.text }}
                </h2>

                <span
                  class="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-900"
                >
                  {{ question.question_type }}
                </span>
              </div>
            </div>

            <!-- PRIMARY INSIGHT -->
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="text-xl font-semibold text-slate-900">
                {{ getPrimaryInsight(question) }}
              </div>

              <div class="mt-1 text-sm text-slate-500">
                n = {{ getResponseCount(question) }}
              </div>
            </div>

            <!-- UNIFORM ANALYTICS LAYOUT -->
            <div class="space-y-4">
              <!-- YES / NO -->
              <template v-if="question.question_type === 'yes_no'">
                <AnalyticsBar
                  label="Yes"
                  :count="question.analytics.counts.yes"
                  :percentage="question.analytics.percentages.yes"
                />

                <AnalyticsBar
                  label="No"
                  :count="question.analytics.counts.no"
                  :percentage="question.analytics.percentages.no"
                />
              </template>

              <!-- SINGLE SELECT -->
              <template v-else-if="question.question_type === 'single_select'">
                <AnalyticsBar
                  v-for="option in question.analytics.options"
                  :key="option.label"
                  :label="option.label"
                  :count="option.count"
                  :percentage="option.percentage"
                />
              </template>

              <!-- MULTI SELECT -->
              <template v-else-if="question.question_type === 'multi_select'">
                <AnalyticsBar
                  v-for="option in question.analytics.options"
                  :key="option.label"
                  :label="option.label"
                  :count="option.count"
                  :percentage="option.percentage"
                />
              </template>

              <!-- RATING -->
              <template v-else-if="question.question_type === 'rating'">
                <AnalyticsBar
                  v-for="item in question.analytics.distribution"
                  :key="item.value"
                  :label="`${item.value} ★`"
                  :count="item.count"
                  :percentage="
                    question.analytics.total
                      ? Math.round((item.count / question.analytics.total) * 100)
                      : 0
                  "
                />
              </template>

              <!-- NUMBER -->
              <template v-else-if="question.question_type === 'number'">
                <div class="grid grid-cols-2 gap-4">
                  <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div class="text-xs uppercase tracking-wide text-slate-500">Minimum</div>

                    <div class="mt-1.5 text-xl font-semibold text-slate-900">
                      {{ question.analytics.min }}
                    </div>
                  </div>

                  <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div class="text-xs uppercase tracking-wide text-slate-500">Maximum</div>

                    <div class="mt-1.5 text-xl font-semibold text-slate-900">
                      {{ question.analytics.max }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- OPEN TEXT -->
              <template v-else-if="question.question_type === 'open_text'">
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div class="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Responses
                  </div>

                  <ul
                    v-if="question.analytics.responses?.length"
                    class="mt-2 space-y-2 text-sm text-slate-600"
                  >
                    <li
                      v-for="(response, responseIndex) in question.analytics.responses"
                      :key="responseIndex"
                      class="rounded-lg border border-slate-200 bg-white px-3 py-1.5"
                    >
                      {{ response }}
                    </li>
                  </ul>

                  <div v-else class="mt-2 text-sm text-slate-500">No responses yet</div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, defineComponent, h, onMounted, ref } from 'vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const templateId = computed(() =>
    String(route.query.template_id || route.params.templateId || '')
  )
  const selectedVersion = computed(() => {
    const rawVersion = route.query.version
    if (rawVersion === undefined || rawVersion === null || rawVersion === '') return null

    const parsed = Number(rawVersion)
    return Number.isFinite(parsed) ? parsed : null
  })

  const analytics = ref({
    questions: []
  })

  const loading = ref(true)
  const error = ref('')

  const AnalyticsBar = defineComponent({
    name: 'AnalyticsBar',
    props: {
      label: {
        type: String,
        default: ''
      },
      count: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      }
    },
    setup(props) {
      return () =>
        h('div', null, [
          h('div', { class: 'mb-2 flex items-center justify-between' }, [
            h('div', { class: 'text-sm font-medium text-slate-700' }, props.label),
            h('div', { class: 'text-sm text-slate-500' }, `${props.count} • ${props.percentage}%`)
          ]),
          h('div', { class: 'h-3 overflow-hidden rounded-full bg-slate-100' }, [
            h('div', {
              class: 'h-full rounded-full bg-emerald-500 transition-all',
              style: { width: `${props.percentage}%` }
            })
          ])
        ])
    }
  })

  function getPrimaryInsight(question) {
    const a = question.analytics

    switch (question.question_type) {
      case 'yes_no':
        return `${a.percentages.yes}% said Yes`

      case 'single_select':
        return a.options?.length ? `${a.options[0].label} is most selected` : 'No responses'

      case 'multi_select':
        return a.options?.length ? `${a.options[0].label} is most mentioned` : 'No responses'

      case 'rating':
        return `Average rating: ${a.average}`

      case 'number':
        return `Average: ${a.average}`

      case 'open_text':
        return `${a.total_answers} responses collected`

      default:
        return ''
    }
  }

  function getResponseCount(question) {
    const a = question.analytics

    switch (question.question_type) {
      case 'yes_no':
      case 'single_select':
      case 'multi_select':
      case 'rating':
      case 'number':
        return a.total || 0

      case 'open_text':
        return a.total_answers || 0

      default:
        return 0
    }
  }

  async function loadAnalytics() {
    try {
      loading.value = true
      error.value = ''

      if (!templateId.value) {
        throw new Error('template_id is required')
      }

      const res = await $fetch('/api/interview-template/analytics/analytics', {
        query: {
          template_id: templateId.value,
          version: selectedVersion.value
        }
      })

      analytics.value = res
      console.log('Loaded analytics:', res)
    } catch (err) {
      console.error(err)
      error.value = err?.data?.statusMessage || err?.message || 'Failed to load analytics.'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadAnalytics()
  })
</script>
