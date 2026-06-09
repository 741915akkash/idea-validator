<script setup>
  import AllNotes from '~/components/knowledgeBase/AllNotes.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })
</script>

<template>
  <main class="h-full overflow-hidden bg-app-bg text-app-text">
    <div class="flex h-full flex-col overflow-hidden">
      <AllNotes />
    </div>
  </main>
</template>
