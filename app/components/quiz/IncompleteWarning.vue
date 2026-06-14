<script setup>
  defineProps({
    questions: Array
  })

  const incomplete = computed(() => questions.some((q) => q.required && !q.answer))
</script>

<template>
  <p v-if="incomplete" class="mt-6 text-base text-red-500">
    Please answer all required questions to continue.
  </p>
</template>
