<script setup>
const props = defineProps({
  quizId: { type: String, required: true },
  questionId: { type: Number, required: true },
})

const open = ref(false)
const loading = ref(false)
const asqs = ref([])

const toggle = async () => {
  open.value = !open.value

  if (open.value && asqs.value.length === 0) {
    loading.value = true
    const res = await $fetch('/api/quiz/asq', {
      query: {
        quiz_id: props.quizId,
        question_id: props.questionId
      }
    })
    asqs.value = res.asqs
    loading.value = false
  }
}

const saveAsqAnswer = async (asq, value) => {
  asq.answer_value = value

  await $fetch('/api/quiz/asq_answer', {
    method: 'POST',
    body: {
      quiz_id: props.quizId,
      question_id: props.questionId,
      asq_id: asq.id,
      answer_value: value
    }
  })
}
</script>

<template>
  <div class="mt-2">
    <button
      class="text-sm text-emerald-700 hover:underline"
      @click="toggle"
    >
      {{ open ? 'Hide breakdown' : 'Break this down' }}
    </button>

    <div v-if="open" class="mt-3 pl-4 border-l space-y-4">
      <p v-if="loading" class="text-sm text-gray-500">
        Loading…
      </p>

      <div
        v-for="asq in asqs"
        :key="asq.id"
        class="text-sm"
      >
        <p class="font-medium mb-1">
          {{ asq.question_text }}
        </p>

        <!-- number -->
        <input
          v-if="asq.input_type === 'number'"
          type="number"
          class="border px-2 py-1 rounded w-32"
          :value="asq.answer_value ?? ''"
          @input="saveAsqAnswer(asq, Number($event.target.value))"
        />

        <!-- boolean -->
        <select
          v-else-if="asq.input_type === 'boolean'"
          class="border px-2 py-1 rounded"
          :value="asq.answer_value ?? ''"
          @change="saveAsqAnswer(asq, $event.target.value === 'true')"
        >
          <option disabled value="">Choose</option>
          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </select>

        <!-- text -->
        <input
          v-else
          type="text"
          class="border px-2 py-1 rounded w-full"
          :value="asq.answer_value ?? ''"
          @blur="saveAsqAnswer(asq, $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>
