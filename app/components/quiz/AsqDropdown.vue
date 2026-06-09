<script setup>
  const props = defineProps({
    quizId: { type: String, required: true },
    questionId: { type: Number, required: true }
  })

  const open = ref(false)
  const loading = ref(false)
  const asqs = ref([])

  const toggle = async () => {
    open.value = !open.value

    if (open.value && asqs.value.length === 0) {
      loading.value = true
      const res = await $fetch('/api/quiz/asqs/asq', {
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

    await $fetch('/api/quiz/asqs/asq_answer', {
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
    <button class="text-app-link text-base hover:underline" @click="toggle">
      {{ open ? 'Hide breakdown' : 'Break this down' }}
    </button>

    <div v-if="open" class="border-app-border mt-3 space-y-4 border-l pl-4">
      <p v-if="loading" class="text-app-muted text-base">Loading…</p>

      <div v-for="asq in asqs" :key="asq.id" class="text-base">
        <p class="text-app-text mb-1 font-medium">
          {{ asq.question_text }}
        </p>

        <!-- number -->
        <input
          v-if="asq.input_type === 'number'"
          type="number"
          class="border-app-border bg-app-card text-app-text w-32 rounded border px-2 py-1"
          :value="asq.answer_value ?? ''"
          @input="saveAsqAnswer(asq, Number($event.target.value))"
        />

        <!-- boolean -->
        <select
          v-else-if="asq.input_type === 'boolean'"
          class="border-app-border bg-app-card text-app-text rounded border px-2 py-1"
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
          class="border-app-border bg-app-card text-app-text placeholder:text-app-muted w-full rounded border px-2 py-1"
          :value="asq.answer_value ?? ''"
          @blur="saveAsqAnswer(asq, $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>
