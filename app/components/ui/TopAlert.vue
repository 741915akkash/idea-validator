<script setup>
  import { computed, onBeforeUnmount, watch } from 'vue'
  import { X } from 'lucide-vue-next'

  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Notice'
    },
    variant: {
      type: String,
      default: 'info' // info | success | warning | error
    },
    autoHideMs: {
      type: Number,
      default: 0
    }
  })

  const emit = defineEmits(['close'])

  let hideTimer = null

  const variantClasses = computed(() => {
    if (props.variant === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    if (props.variant === 'warning') return 'border-amber-200 bg-amber-50 text-amber-900'
    if (props.variant === 'error') return 'border-red-200 bg-red-50 text-red-900'
    return 'border-sky-200 bg-sky-50 text-sky-900'
  })

  function clearHideTimer() {
    if (!hideTimer) return
    clearTimeout(hideTimer)
    hideTimer = null
  }

  watch(
    () => props.open,
    (isOpen) => {
      clearHideTimer()
      if (!isOpen || props.autoHideMs <= 0) return
      hideTimer = setTimeout(() => emit('close'), props.autoHideMs)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    clearHideTimer()
  })
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="-translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-2 opacity-0"
  >
    <div v-if="open" class="fixed inset-x-0 top-4 z-[90] px-4">
      <div
        class="mx-auto flex w-full max-w-3xl items-start gap-3 rounded-lg border px-4 py-3 shadow-lg"
        :class="variantClasses"
        role="alert"
        aria-live="assertive"
      >
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold">{{ title }}</p>
          <p class="mt-1 text-sm leading-6">{{ message }}</p>
        </div>
        <button
          type="button"
          class="mt-0.5 rounded p-1 opacity-80 transition hover:bg-black/5 hover:opacity-100"
          aria-label="Dismiss alert"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>
