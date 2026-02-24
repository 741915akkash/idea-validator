<script setup>
  import { ref, watch, onMounted } from 'vue'

  const props = defineProps({
    quizId: String,
    questionId: Number,
    readOnly: Boolean
  })

  const noteText = ref('')
  const saved = ref(false)

  onMounted(async () => {
    const res = await $fetch('/api/quiz/notes/note', {
      params: {
        quiz_id: props.quizId,
        question_id: props.questionId
      }
    })
    noteText.value = res.note_text || ''
  })

  watch(
    noteText,
    async (val) => {
      if (props.readOnly) return
      saved.value = false

      await $fetch('/api/quiz/notes/note', {
        method: 'POST',
        body: {
          quiz_id: props.quizId,
          question_id: props.questionId,
          note_text: val
        }
      })

      saved.value = true
    },
    { debounce: 700 }
  )
</script>

<template>
  <div class="space-y-1">
    <label class="text-xs text-gray-500">Notes</label>

    <textarea
      v-model="noteText"
      :readonly="readOnly"
      class="box-border min-h-[270px] w-full resize-y rounded border border-2 border-gray-500 p-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-0"
    />

    <span v-if="saved" class="text-xs text-green-600">Saved ✓</span>
  </div>
</template>
