<script setup>
  import { onMounted } from 'vue'
  import LeadsPageContent from '~/components/crm/LeadsPageContent.vue'
  import { crmGlobalFetch } from '~/composables/useCrmRequest'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  onMounted(async () => {
    await crmGlobalFetch('/api/crm/pipelines/create-default-pipeline', {
      method: 'POST'
    })
  })
</script>

<template>
  <LeadsPageContent />
</template>
