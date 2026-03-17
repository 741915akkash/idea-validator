<script setup>
import { navigateTo } from '#app'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

navigateTo('/quiz/overview')
</script>

<template>
  <!-- Intentionally empty: redirect-only page -->
</template>
