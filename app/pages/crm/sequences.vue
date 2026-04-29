<script setup>
  import { ref } from 'vue'
  import SequenceEditor from '~/components/crm/sequences/SequenceEditor.vue'
  import SequenceList from '~/components/crm/sequences/SequenceList.vue'
  import { useSequencesStore } from '~/stores/sequences'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const sequencesStore = useSequencesStore()
  const selectedSequence = ref(null)
  const isEditorOpen = ref(false)

  await sequencesStore.fetchSequences()

  function openEditor(sequence) {
    selectedSequence.value = sequence || null
    isEditorOpen.value = true
  }

  function closeEditor() {
    selectedSequence.value = null
    isEditorOpen.value = false
  }
</script>

<template>
  <SequenceList v-if="!isEditorOpen" @edit="openEditor" />
  <SequenceEditor v-else :sequence="selectedSequence" @back="closeEditor" />
</template>
