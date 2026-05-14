<script setup>
  import AllNotes from '~/components/knowledgeBase/AllNotes.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })
</script>

<template>
  <main class="h-[calc(100vh-2rem)] bg-slate-50">
    <div class="h-full overflow-hidden text-slate-400">
      <AllNotes />
    </div>
  </main>
</template>
