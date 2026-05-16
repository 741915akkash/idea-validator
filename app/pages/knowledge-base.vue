<script setup>
  import AllNotes from '~/components/knowledgeBase/AllNotes.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })
</script>

<template>
  <main class="min-h-screen">
    <div class="flex flex-col">
      <AllNotes />
    </div>
  </main>
</template>
