<script setup>
defineProps({
  questions: Array
})

const emit = defineEmits(['answer'])

function handleAnswer(questionId, value) {
  emit('answer', { questionId, value })
}
</script>

<template>
  <div class="space-y-8">
    <div
      v-for="q in questions"
      :key="q.id"
    >
      <h3 class="font-semibold mb-2">
        {{ q.text }}
      </h3>

      <div class="space-y-2">
        <QuestionOption
          v-for="opt in q.options"
          :key="opt.value"
          :option="opt"
          :selected="q.answer === opt.value"
          @select="handleAnswer(q.id, opt.value)"
        />
      </div>
    </div>
  </div>
</template>
