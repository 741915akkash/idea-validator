<script setup>
  import LeadsPageContent from '~/components/crm/LeadsPageContent.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })
</script>

<template>
  <LeadsPageContent />
</template>
