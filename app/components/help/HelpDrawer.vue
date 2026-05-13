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
      class="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-white sm:left-auto sm:right-0 sm:w-full sm:max-w-md sm:border-l sm:border-gray-200 sm:shadow-2xl"
    >
      <!-- HEADER -->
      <div class="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Help</p>

            <h2 class="mt-1 text-2xl font-bold text-gray-900">
              {{ title }}
            </h2>

            <p v-if="subtitle" class="mt-2 text-sm leading-relaxed text-gray-500">
              {{ subtitle }}
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
        <!-- WHAT THIS DOES -->
        <details
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500">
              What this does
            </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="border-t border-gray-100 px-5 py-4">
            <p class="text-sm leading-7 text-gray-700">
              {{ what }}
            </p>
          </div>
        </details>

        <!-- WHY IT MATTERS -->
        <details
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500">
              Why it matters
            </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="border-t border-gray-100 px-5 py-4">
            <p class="text-sm leading-7 text-gray-700">
              {{ why }}
            </p>
          </div>
        </details>

        <!-- WORKFLOW -->
        <details
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500">
              Typical workflow
            </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="space-y-3 border-t border-gray-100 px-5 py-4">
            <div
              v-for="(step, index) in workflow"
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
          open
          class="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500">
              Best practices
            </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="space-y-3 border-t border-gray-100 px-5 py-4">
            <div
              v-for="(tip, index) in tips"
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
        <details open class="group overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4">
            <span class="text-sm font-bold uppercase tracking-wide text-gray-500">
              Related features
            </span>

            <ChevronDown class="h-4 w-4 text-gray-400 transition group-open:rotate-180" />
          </summary>

          <div class="flex flex-wrap gap-2 border-t border-gray-100 px-5 py-4">
            <button
              v-for="item in related"
              :key="item"
              class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {{ item }}
            </button>
          </div>
        </details>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
  import { X, ChevronDown } from 'lucide-vue-next'

  defineProps({
    open: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: ''
    },

    subtitle: {
      type: String,
      default: ''
    },

    what: {
      type: String,
      default: ''
    },

    why: {
      type: String,
      default: ''
    },

    workflow: {
      type: Array,
      default: () => []
    },

    tips: {
      type: Array,
      default: () => []
    },

    related: {
      type: Array,
      default: () => []
    }
  })

  defineEmits(['close'])
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
