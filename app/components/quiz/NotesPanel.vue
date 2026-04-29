<script setup>
import QuestionNotes from './QuestionNotes.vue'

defineProps({
  quizId: String,
  questionId: Number,
  readOnly: Boolean
})
</script>

<template>
  <aside class="border-l pl-4">
    <QuestionNotes
      :quiz-id="quizId"
      :question-id="questionId"
      :read-only="readOnly"
    />
  </aside>
</template>
