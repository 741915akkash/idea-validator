<script setup>
  import { History, X } from 'lucide-vue-next'
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'

  const props = defineProps({
    activities: { type: Array, default: () => [] }
  })

  const router = useRouter()
  const quizStore = useQuizSessionStore()
  const showPanel = ref(false)

  const recentActivities = computed(() => {
    return props.activities
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
  })

  const formatExactDate = (dateString) => {
    if (!dateString) return '—'

    const date = new Date(dateString)

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const now = new Date()

    const diffMs = now - date
    const diffMin = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return formatExactDate(dateString)
  }

  async function openInterviewFromActivity(interviewId) {
    const quizId = quizStore.quizId
    if (!quizId || !interviewId) return

    showPanel.value = false

    await router.push({
      path: '/quiz/interviews',
      query: {
        quiz_id: quizId,
        open_interview_id: interviewId
      }
    })
  }
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h3
        class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-app-muted"
      >
        <History class="h-3 w-3" /> Activity Feed
      </h3>
    </div>

    <!-- Top 3 Feed -->
    <div
      class="relative space-y-8 before:absolute before:bottom-0 before:left-2 before:top-2 before:w-px before:bg-gray-100"
    >
      <div v-for="act in recentActivities" :key="act.id" class="relative pl-8">
        <div
          :class="[
            'absolute left-0 top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ring-4 ring-white',
            act.type === 'note'
              ? 'bg-emerald-500/10'
              : act.type === 'email'
                ? 'bg-blue-500'
                : 'bg-gray-300'
          ]"
        >
          <div class="h-1.5 w-1.5 rounded-full text-app-text"></div>
        </div>

        <div class="flex flex-col gap-1">
          <p class="text-[13px] leading-relaxed text-app-muted">
            {{ act.text }}
          </p>

          <button
            v-if="act.type === 'interview' && act.interview_id"
            @click="openInterviewFromActivity(act.interview_id)"
            class="w-fit text-[11px] font-medium text-violet-700 hover:underline"
          >
            Open Interview
          </button>

          <div class="flex items-center gap-2 text-[11px] text-app-muted">
            <span :title="new Date(act.created_at).toLocaleString()">
              {{ formatExactDate(act.created_at) }}
            </span>

            <span class="h-0.5 w-0.5 rounded-full bg-gray-300"></span>

            <span class="text-app-muted">
              {{ formatRelativeDate(act.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!activities.length" class="py-2 pl-8 text-xs italic text-app-muted">
        No activities yet.
      </div>
    </div>

    <button
      v-if="activities.length > 0"
      @click="showPanel = true"
      class="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-app-border py-2.5 text-[10px] font-bold uppercase tracking-widest text-app-muted transition-all hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600"
    >
      View All Activity ({{ activities.length }})
    </button>

    <!-- Side Panel -->
    <Teleport to="body">
      <!-- Backdrop -->
      <div
        v-if="showPanel"
        @click="showPanel = false"
        class="fixed inset-0 z-[200] bg-black/10 backdrop-blur-sm"
      ></div>

      <!-- Panel -->
      <div
        v-if="showPanel"
        class="fixed inset-y-0 right-0 z-[201] flex w-full max-w-[480px] flex-col border-l border-app-border text-app-text shadow-2xl"
      >
        <!-- Header -->
        <header class="flex h-[72px] items-center justify-between border-b border-app-border px-6">
          <h2
            class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-app-text"
          >
            <History class="h-4 w-4 text-emerald-500" />
            Activity History
          </h2>

          <button
            @click="showPanel = false"
            class="rounded-full p-2 text-app-muted hover:bg-gray-100 hover:text-app-muted"
          >
            <X class="h-5 w-5" />
          </button>
        </header>

        <!-- Content -->
        <main class="bg-app-panel/40 flex-1 overflow-y-auto p-6">
          <div
            class="relative space-y-10 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-px before:bg-gray-200"
          >
            <div v-for="act in activities" :key="'panel-' + act.id" class="relative pl-10">
              <div
                :class="[
                  'absolute left-0 top-1 h-5 w-5 rounded-full border-4 border-white ring-4 ring-white',
                  act.type === 'note'
                    ? 'bg-emerald-500/10'
                    : act.type === 'email'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                ]"
              ></div>

              <div class="rounded-xl border border-app-border p-4 text-app-text">
                <div class="mb-2 flex justify-between text-xs text-app-muted">
                  <span class="font-medium uppercase">{{ act.type }}</span>
                  <div class="flex items-center gap-2">
                    <span :title="new Date(act.created_at).toLocaleString()">
                      {{ formatExactDate(act.created_at) }}
                    </span>

                    <span class="h-0.5 w-0.5 rounded-full bg-gray-300"></span>

                    <span class="text-app-muted">
                      {{ formatRelativeDate(act.created_at) }}
                    </span>
                  </div>
                </div>

                <p class="text-sm leading-relaxed text-app-muted">
                  {{ act.text }}
                </p>

                <button
                  v-if="act.type === 'interview' && act.interview_id"
                  @click="openInterviewFromActivity(act.interview_id)"
                  class="mt-3 w-fit text-xs font-medium text-violet-700 hover:underline"
                >
                  Open Interview
                </button>
              </div>
            </div>

            <div v-if="!activities.length" class="py-16 text-center text-sm text-app-muted">
              No activity history recorded.
            </div>
          </div>
        </main>
      </div>
    </Teleport>
  </div>
</template>
