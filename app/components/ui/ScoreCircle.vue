<script setup>
  defineProps({
    value: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    colorClass: {
      type: String,
      required: true
    }
  })
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <svg viewBox="0 0 36 36" class="h-28 w-28">
      <!-- Track -->
      <path
        class="text-white dark:text-app-muted"
        stroke-width="3"
        fill="none"
        stroke="currentColor"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />

      <!-- Progress -->
      <path
        :class="colorClass"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke="currentColor"
        :stroke-dasharray="`${value}, 100`"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
    </svg>

    <div class="text-xl font-medium">{{ value }}</div>
    <div class="text-base text-app-muted">{{ label }}</div>
  </div>
</template>
