<script setup>
defineProps({
  quiz: Object
})
</script>

<template>
  <ul class="space-y-3">
    <li
      v-for="cp in quiz.checkpoints"
      :key="cp.key"
      class="flex items-center justify-between"
    >
      <span>{{ cp.label }}</span>

      <span
        v-if="cp.complete"
        class="text-green-600"
      >✓</span>

      <span
        v-else
        class="text-yellow-500"
      >•</span>
    </li>
  </ul>
</template>
