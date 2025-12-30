<script setup>
definePageMeta({
  middleware: 'noindex'
})

const { startOrResumeQuiz } = useQuizNavigation()

onMounted(async () => {
  await startOrResumeQuiz()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-gray-600">Preparing your quiz…</p>
  </div>
</template>
