<script setup>
definePageMeta({
  middleware: 'noindex'
})

const route = useRoute()
const checkpoint = route.params.checkpoint

const { quiz, questions, saveAnswer } = useQuizState(checkpoint)
</script>

<template>
  <QuizLayout>
    <template #sidebar>
      <QuizStepper :quiz="quiz" />
    </template>

    <template #main>
      <ResumeBanner :quiz="quiz" />

      <QuestionRenderer
        :questions="questions"
        @answer="saveAnswer"
      />

      <IncompleteWarning :questions="questions" />
    </template>
  </QuizLayout>
</template>
