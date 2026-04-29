<script setup>
  import { History, X } from 'lucide-vue-next'
  import { ref, computed } from 'vue'

  const props = defineProps({
    activities: { type: Array, default: () => [] }
  })

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
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h3
        class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
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
              ? 'bg-emerald-500'
              : act.type === 'email'
                ? 'bg-blue-500'
                : 'bg-gray-300'
          ]"
        >
          <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
        </div>

        <div class="flex flex-col gap-1">
          <p class="text-[13px] leading-relaxed text-gray-700">
            {{ act.text }}
          </p>

          <div class="flex items-center gap-2 text-[11px] text-gray-400">
            <span :title="new Date(act.created_at).toLocaleString()">
              {{ formatExactDate(act.created_at) }}
            </span>

            <span class="h-0.5 w-0.5 rounded-full bg-gray-300"></span>

            <span class="text-gray-500">
              {{ formatRelativeDate(act.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!activities.length" class="py-2 pl-8 text-xs italic text-gray-400">
        No activities yet.
      </div>
    </div>

    <button
      v-if="activities.length > 0"
      @click="showPanel = true"
      class="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-100 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600"
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
        class="fixed inset-y-0 right-0 z-[201] flex w-full max-w-[480px] flex-col border-l border-gray-100 bg-white shadow-2xl"
      >
        <!-- Header -->
        <header class="flex h-[72px] items-center justify-between border-b border-gray-100 px-6">
          <h2
            class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900"
          >
            <History class="h-4 w-4 text-emerald-500" />
            Activity History
          </h2>

          <button
            @click="showPanel = false"
            class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X class="h-5 w-5" />
          </button>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto bg-gray-50/40 p-6">
          <div
            class="relative space-y-10 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-px before:bg-gray-200"
          >
            <div v-for="act in activities" :key="'panel-' + act.id" class="relative pl-10">
              <div
                :class="[
                  'absolute left-0 top-1 h-5 w-5 rounded-full border-4 border-white ring-4 ring-white',
                  act.type === 'note'
                    ? 'bg-emerald-500'
                    : act.type === 'email'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                ]"
              ></div>

              <div class="rounded-xl border border-gray-100 bg-white p-4">
                <div class="mb-2 flex justify-between text-xs text-gray-400">
                  <span class="font-medium uppercase">{{ act.type }}</span>
                  <div class="flex items-center gap-2">
                    <span :title="new Date(act.created_at).toLocaleString()">
                      {{ formatExactDate(act.created_at) }}
                    </span>

                    <span class="h-0.5 w-0.5 rounded-full bg-gray-300"></span>

                    <span class="text-gray-500">
                      {{ formatRelativeDate(act.created_at) }}
                    </span>
                  </div>
                </div>

                <p class="text-sm leading-relaxed text-gray-700">
                  {{ act.text }}
                </p>
              </div>
            </div>

            <div v-if="!activities.length" class="py-16 text-center text-sm text-gray-400">
              No activity history recorded.
            </div>
          </div>
        </main>
      </div>
    </Teleport>
  </div>
</template>
