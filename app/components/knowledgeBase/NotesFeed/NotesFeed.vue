<script setup>
  import NoteCard from './NoteCard.vue'

  defineProps({
    notes: Array
  })

  defineEmits(['open'])
</script>

<template>
  <div class="space-y-4">
    <NoteCard v-for="note in notes" :key="note.id" :note="note" @open="$emit('open', note)" />
  </div>
</template>
