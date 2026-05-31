<script setup>
  import TemplateForm from '~/components/interview/template/TemplateForm.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const router = useRouter()
  const route = useRoute()

  const saving = ref(false)

  async function createTemplate(payload) {
    try {
      saving.value = true

      await $fetch('/api/interview-template/create', {
        method: 'POST',
        body: {
          ...payload,
          quiz_id: route.query.quiz_id || null
        }
      })

      await router.push('/quiz/Interview-templates')
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <TemplateForm mode="create" :saving="saving" @save="createTemplate" @cancel="router.back()" />
</template>
