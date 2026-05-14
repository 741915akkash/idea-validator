<script setup>
  import AllNotes from '~/components/knowledgeBase/AllNotes.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })
</script>

<template>
  <main class="h-[calc(100vh-2rem)]">
    <div class="h-full overflow-hidden">
      <AllNotes />
    </div>
  </main>
</template>
