<script setup>
defineProps({
  quiz: Object
})
</script>

<template>
  <div
    v-if="quiz.hasIncomplete"
    class="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded"
  >
    You have unfinished questions. You can resume anytime.
  </div>
</template>
