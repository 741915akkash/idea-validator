<script setup>
import { useQuizSessionStore } from '~/stores/quizSession'

const quizStore = useQuizSessionStore()
if (import.meta.client) {
  quizStore.hydrate()
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
