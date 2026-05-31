<template>
  <div class="min-h-screen bg-white p-6">
    <!-- HEADER -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-slate-900">
          {{ analytics?.template?.title || 'Analytics' }}
        </h1>

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
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <!-- QUESTION HEADER -->
        <div class="mb-6">
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600"
            >
              {{ index + 1 }}
            </div>

            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ question.text }}
              </h2>

              <p class="mt-1 text-xs uppercase tracking-wide text-slate-500">
                {{ question.question_type }}
              </p>
            </div>
          </div>
        </div>

        <!-- YES / NO -->
        <div v-if="question.question_type === 'yes_no'" class="space-y-4">
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
        </div>

        <!-- SINGLE SELECT -->
        <div v-else-if="question.question_type === 'single_select'" class="space-y-4">
          <AnalyticsBar
            v-for="option in question.analytics.options"
            :key="option.label"
            :label="option.label"
            :count="option.count"
            :percentage="option.percentage"
          />
        </div>

        <!-- MULTI SELECT -->
        <div v-else-if="question.question_type === 'multi_select'" class="space-y-4">
          <AnalyticsBar
            v-for="option in question.analytics.options"
            :key="option.label"
            :label="option.label"
            :count="option.count"
            :percentage="option.percentage"
          />
        </div>

        <!-- RATING -->
        <div v-else-if="question.question_type === 'rating'">
          <div class="mb-6 flex items-center gap-6">
            <div>
              <div class="text-xs uppercase tracking-wide text-slate-500">Average</div>

              <div class="mt-1 text-4xl font-semibold text-slate-900">
                {{ question.analytics.average }}
              </div>
            </div>

            <div class="h-12 w-px bg-slate-200" />

            <div>
              <div class="text-xs uppercase tracking-wide text-slate-500">Responses</div>

              <div class="mt-1 text-2xl font-semibold text-slate-900">
                {{ question.analytics.total }}
              </div>
            </div>
          </div>

          <div class="space-y-3">
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
          </div>
        </div>

        <!-- NUMBER -->
        <div v-else-if="question.question_type === 'number'" class="grid grid-cols-3 gap-4">
          <StatCard label="Average" :value="question.analytics.average" />

          <StatCard label="Minimum" :value="question.analytics.min" />

          <StatCard label="Maximum" :value="question.analytics.max" />
        </div>

        <!-- OPEN TEXT -->
        <div
          v-else-if="question.question_type === 'open_text'"
          class="rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <div class="text-sm font-medium text-amber-800">Open text analysis coming next</div>

          <div class="mt-1 text-sm text-amber-700">
            {{ question.analytics.total_answers }} responses collected
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const templateId = computed(() => String(route.query.template_id || route.params.templateId || ''))

  const analytics = ref({
    questions: []
  })

  const loading = ref(true)
  const error = ref('')

  async function loadAnalytics() {
    try {
      loading.value = true
      error.value = ''

      if (!templateId.value) {
        throw new Error('template_id is required')
      }

      const res = await $fetch('/api/interview-template/analytics/analytics', {
        query: {
          template_id: templateId.value
        }
      })

      analytics.value = res
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

<script>
  export default {
    components: {
      AnalyticsBar: {
        props: {
          label: String,
          count: Number,
          percentage: Number
        },

        template: `
        <div>
          <div class="mb-2 flex items-center justify-between">
            <div class="text-sm font-medium text-slate-700">
              {{ label }}
            </div>

            <div class="text-sm text-slate-500">
              {{ count }} • {{ percentage }}%
            </div>
          </div>

          <div class="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all"
              :style="{ width: percentage + '%' }"
            />
          </div>
        </div>
      `
      },

      StatCard: {
        props: {
          label: String,
          value: [String, Number]
        },

        template: `
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div class="text-xs uppercase tracking-wide text-slate-500">
            {{ label }}
          </div>

          <div class="mt-2 text-3xl font-semibold text-slate-900">
            {{ value }}
          </div>
        </div>
      `
      }
    }
  }
</script>
