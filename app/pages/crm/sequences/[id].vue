<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import SequenceEditor from '~/components/crm/sequences/SequenceEditor.vue'
  import { useSequencesStore } from '~/stores/sequences'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const router = useRouter()
  const sequencesStore = useSequencesStore()
  const sequence = ref(null)

  const id = Number(route.params.id)

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Sequence not found' })
  }

  try {
    sequence.value = await sequencesStore.fetchSequenceById(id)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Sequence not found' })
  }

  function goBack() {
    router.push('/crm/sequences')
  }
</script>

<template>
  <SequenceEditor v-if="sequence" :sequence="sequence" @back="goBack" />
</template>
