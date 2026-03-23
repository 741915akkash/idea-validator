<script setup>
import { useQuizSessionStore } from '~/stores/quizSession'

const quizStore = useQuizSessionStore()
if (import.meta.client) {
  quizStore.hydrate()
}
</script>

<template>
  <div
    class="font-sans tracking-[0.02em] [&_h1]:tracking-[0.02em] [&_h2]:tracking-[0.02em] [&_h3]:tracking-[0.02em]"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
