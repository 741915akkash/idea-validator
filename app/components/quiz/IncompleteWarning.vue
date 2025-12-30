<script setup>
defineProps({
  questions: Array
})

const incomplete = computed(() =>
  questions.some(q => q.required && !q.answer)
)
</script>

<template>
  <p
    v-if="incomplete"
    class="mt-6 text-sm text-red-600"
  >
    Please answer all required questions to continue.
  </p>
</template>
