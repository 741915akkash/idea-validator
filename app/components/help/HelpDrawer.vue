<template>
  <!-- BACKDROP -->
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
      @click="$emit('close')"
    />
  </Transition>

  <!-- DRAWER -->
  <Transition name="slide">
    <aside
      v-if="open"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      class="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-app-bg text-app-text sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:border-l sm:border-app-border sm:shadow-2xl"
    >
      <!-- MOBILE HANDLE -->
      <div class="mt-5 flex justify-center sm:hidden">
        <div class="h-1.5 w-12 rounded-full bg-app-border" />
      </div>

      <!-- HEADER -->
      <div class="sticky top-0 z-10 bg-app-card border-b border-app-border px-5 py-4 text-app-text sm:px-6">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Help</p>

            <h2 class="mt-1 text-2xl font-bold text-app-text">
              {{ content.title }}
            </h2>

            <p v-if="content.subtitle" class="mt-2 text-sm leading-relaxed text-app-muted">
              {{ content.subtitle }}
            </p>
          </div>

          <!-- CLOSE -->
          <button
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-app-muted transition hover:bg-app-hover hover:text-app-text"
            @click="$emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-y-auto bg-app-card px-5 py-5 sm:px-6 sm:py-6">
        <!-- PURPOSE -->
        <details
          v-if="content.purpose"
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-app-border text-app-text"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-app-muted"> Purpose </span>

            <ChevronDown class="h-4 w-4 text-app-muted transition group-open:rotate-180" />
          </summary>

          <div class="border-t border-app-border px-5 py-4">
            <p class="whitespace-pre-line text-sm leading-6 text-app-text">
              {{ content.purpose }}
            </p>
          </div>
        </details>

        <!-- WORKFLOW -->
        <!-- WORKFLOW -->
        <button
          v-if="content.workflow"
          type="button"
          class="mb-4 flex w-full items-center justify-between rounded-2xl border border-app-border px-5 py-4 text-left text-app-text transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
          @click="showWorkflowModal = true"
        >
          <div>
            <div class="text-sm font-bold uppercase tracking-wide text-app-muted">Workflow</div>

            <div class="mt-1 text-sm text-app-muted">View validation flow diagram</div>
          </div>

          <ChevronRight class="h-5 w-5 text-app-muted" />
        </button>

        <!-- STEPS -->
        <details
          v-if="content.steps?.length"
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-app-border text-app-text"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-app-muted"> Steps </span>

            <ChevronDown class="h-4 w-4 text-app-muted transition group-open:rotate-180" />
          </summary>

          <div class="space-y-3 border-t border-app-border px-5 py-4">
            <div
              v-for="(step, index) in content.steps"
              :key="index"
              class="flex items-start gap-3 rounded-2xl border border-app-border bg-app-card p-4"
            >
              <div
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white"
              >
                {{ index + 1 }}
              </div>

              <p class="text-sm leading-6 text-app-text">
                {{ step }}
              </p>
            </div>
          </div>
        </details>

        <!-- BEST PRACTICES -->
        <details
          v-if="content.bestPractices?.length"
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-app-border text-app-text"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-app-muted">
              Best Practices
            </span>

            <ChevronDown class="h-4 w-4 text-app-muted transition group-open:rotate-180" />
          </summary>

          <div class="space-y-3 border-t border-app-border px-5 py-4">
            <div
              v-for="(tip, index) in content.bestPractices"
              :key="index"
              class="rounded-2xl border border-app-border bg-app-panel p-4"
            >
              <p class="whitespace-pre-line text-sm leading-6 text-app-text">
                {{ tip }}
              </p>
            </div>
          </div>
        </details>

        <!-- RELATED -->
        <details
          v-if="relatedItems.length"
          open
          class="group overflow-hidden rounded-2xl border border-app-border text-app-text"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-app-muted">
              Related Features
            </span>

            <ChevronDown class="h-4 w-4 text-app-muted transition group-open:rotate-180" />
          </summary>

          <div class="flex flex-wrap gap-2 border-t border-app-border px-5 py-4">
            <template v-for="item in relatedItems" :key="`${item.label}-${item.to || 'static'}`">
              <NuxtLink
                v-if="item.to"
                :to="item.to"
                class="rounded-xl border border-app-border px-3 py-2 text-sm font-medium text-app-text transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                @click="emit('close')"
              >
                {{ item.label }}
              </NuxtLink>

              <button
                v-else
                type="button"
                class="rounded-xl border border-app-border px-3 py-2 text-sm font-medium text-app-text transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
              >
                {{ item.label }}
              </button>
            </template>
          </div>
        </details>
      </div>

      <!-- WORKFLOW MODAL -->
      <Transition name="fade">
        <div
          v-if="showWorkflowModal"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          @click.self="showWorkflowModal = false"
        >
          <div
            class="relative flex w-fit max-w-[95vw] flex-col overflow-hidden rounded-3xl border border-app-border bg-app-panel text-app-text shadow-2xl"
          >
            <!-- HEADER -->
            <div class="flex items-center justify-between border-b border-app-border px-6 py-5">
              <div>
                <div class="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                  Workflow
                </div>

                <h3 class="mt-1 text-2xl font-bold text-app-text">{{ content.title }} Flow</h3>
              </div>

              <button
                class="flex h-11 w-11 items-center justify-center rounded-xl text-app-muted transition hover:bg-app-hover hover:text-app-muted"
                @click="showWorkflowModal = false"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <!-- CONTENT -->
            <div class="max-h-[85vh] overflow-y-auto overflow-x-hidden bg-app-card px-10 py-12">
              <WorkflowDiagram :workflow="content.workflow" />
            </div>
          </div>
        </div>
      </Transition>
    </aside>
  </Transition>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { X, ChevronDown, ChevronRight } from 'lucide-vue-next'

  import WorkflowDiagram from '~/components/help/WorkflowDiagram.vue'

  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },

    content: {
      type: Object,
      default: () => ({})
    }
  })

  const emit = defineEmits(['close'])

  const showWorkflowModal = ref(false)

  let touchStartY = 0
  let touchEndY = 0

  function handleTouchStart(event) {
    touchStartY = event.changedTouches[0].clientY
  }

  function handleTouchEnd(event) {
    touchEndY = event.changedTouches[0].clientY

    const distance = touchEndY - touchStartY

    // meaningful downward swipe
    if (distance > 120) {
      emit('close')
    }
  }

  const relatedItems = computed(() =>
    (props.content.related || []).map((item) => {
      if (typeof item === 'string') {
        return {
          label: item,
          to: null
        }
      }

      return {
        label: String(item?.label || ''),
        to: item?.to || null
      }
    })
  )
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition:
      transform 0.28s ease,
      opacity 0.28s ease;
  }

  /* MOBILE */
  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }

  /* DESKTOP */
  @media (min-width: 640px) {
    .slide-enter-from,
    .slide-leave-to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  summary::-webkit-details-marker {
    display: none;
  }
</style>
