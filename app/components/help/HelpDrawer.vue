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
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      v-if="open"
      class="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-white sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:border-l sm:border-gray-200 sm:shadow-2xl"
    >
      <div class="mt-5 flex justify-center sm:hidden">
        <div class="h-1.5 w-12 rounded-full bg-gray-300" />
      </div>
      <!-- HEADER -->
      <div class="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Help</p>

            <h2 class="mt-1 text-2xl font-bold text-gray-900">
              {{ content.title }}
            </h2>

            <p v-if="content.subtitle" class="mt-2 text-sm leading-relaxed text-gray-500">
              {{ content.subtitle }}
            </p>
          </div>

          <!-- CLOSE -->
          <button
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            @click="$emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
        <!-- PURPOSE -->
        <details
          v-if="content.purpose"
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500"> Purpose </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="border-t border-gray-100 px-5 py-4">
            <p class="text-sm leading-7 text-gray-700">
              {{ content.purpose }}
            </p>
          </div>
        </details>

        <!-- WORKFLOW -->
        <details
          v-if="content.workflow?.length"
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500"> Workflow </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="space-y-3 border-t border-gray-100 px-5 py-4">
            <div
              v-for="(step, index) in content.workflow"
              :key="index"
              class="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <div
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
              >
                {{ index + 1 }}
              </div>

              <p class="text-sm leading-6 text-gray-700">
                {{ step }}
              </p>
            </div>
          </div>
        </details>

        <!-- BEST PRACTICES -->
        <details
          v-if="content.bestPractices?.length"
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500">
              Best Practices
            </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="space-y-3 border-t border-gray-100 px-5 py-4">
            <div
              v-for="(tip, index) in content.bestPractices"
              :key="index"
              class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
            >
              <p class="text-sm leading-6 text-emerald-900">
                {{ tip }}
              </p>
            </div>
          </div>
        </details>

        <!-- RELATED -->
        <details
          v-if="relatedItems.length"
          open
          class="group overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500">
              Related Features
            </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="flex flex-wrap gap-2 border-t border-gray-100 px-5 py-4">
            <template v-for="item in relatedItems" :key="`${item.label}-${item.to || 'static'}`">
              <NuxtLink
                v-if="item.to"
                :to="item.to"
                class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                @click="emit('close')"
              >
                {{ item.label }}
              </NuxtLink>

              <button
                v-else
                type="button"
                class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {{ item.label }}
              </button>
            </template>
          </div>
        </details>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
  import { computed } from 'vue'
  import { X, ChevronDown } from 'lucide-vue-next'

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

  let touchStartY = 0
  let touchEndY = 0

  function handleTouchStart(event) {
    touchStartY = event.changedTouches[0].clientY
  }

  function handleTouchEnd(event) {
    touchEndY = event.changedTouches[0].clientY

    const distance = touchEndY - touchStartY

    // only close on meaningful downward swipe
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
