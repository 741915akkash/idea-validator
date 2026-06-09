<script setup>
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import SavedStatus from '~/components/ui/SavedStatus.vue'

  const props = defineProps({
    quizId: String,
    questionId: Number,
    readOnly: Boolean
  })

  const noteText = ref('')
  const saved = ref(false)
  let saveDebounceTimer = null
  let savedBadgeTimer = null

  onMounted(async () => {
    const res = await $fetch('/api/quiz/notes/note', {
      params: {
        quiz_id: props.quizId,
        question_id: props.questionId
      }
    })
    noteText.value = res.note_text || ''
  })

  watch(noteText, (val) => {
    if (props.readOnly) return
    saved.value = false

    if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
    saveDebounceTimer = setTimeout(async () => {
      await $fetch('/api/quiz/notes/note', {
        method: 'POST',
        body: {
          quiz_id: props.quizId,
          question_id: props.questionId,
          note_text: val
        }
      })

      saved.value = true
      if (savedBadgeTimer) clearTimeout(savedBadgeTimer)
      savedBadgeTimer = setTimeout(() => {
        saved.value = false
      }, 1000)
    }, 700)
  })

  onBeforeUnmount(() => {
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
    if (savedBadgeTimer) clearTimeout(savedBadgeTimer)
  })
</script>

<template>
  <div class="space-y-1">
    <label class="text-app-muted text-xs">Notes</label>

    <textarea
      v-model="noteText"
      :readonly="readOnly"
      class="border-app-border bg-app-panel text-app-text placeholder:text-app-muted box-border min-h-[270px] w-full resize-y rounded-lg border p-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-0"
    />

    <SavedStatus v-if="saved" />
  </div>
</template>
