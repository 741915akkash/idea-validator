<script setup>
  import TemplateForm from '~/components/interview/template/TemplateForm.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const router = useRouter()
  const route = useRoute()

  const templateId = String(route.params.templateId)

  const loading = ref(true)
  const saving = ref(false)

  const template = ref(null)

  const mode = computed(() => {
    return route.query.mode === 'edit' ? 'edit' : 'view'
  })

  function normalizeQuestion(row) {
    const parsed =
      row?.options_json && typeof row.options_json === 'string'
        ? JSON.parse(row.options_json)
        : row?.options_json || {}

    return {
      id: row.id,
      text: row.text || '',
      type: row.question_type || 'open_text',
      options: parsed?.options || [],
      min: Number(parsed?.min ?? 1),
      max: Number(parsed?.max ?? 5)
    }
  }

  async function loadTemplate() {
    try {
      loading.value = true

      const res = await $fetch('/api/interview-template/get', {
        query: {
          template_id: templateId
        }
      })

      template.value = {
        title: res?.template?.title || '',
        description: res?.template?.description || '',
        tags: Array.isArray(res?.template?.tags)
          ? res.template.tags.join(', ')
          : res?.template?.tags || '',

        questions: (res?.questions || []).map(normalizeQuestion)
      }
    } finally {
      loading.value = false
    }
  }

  async function updateTemplate(payload) {
    try {
      saving.value = true

      await $fetch('/api/interview-template/update', {
        method: 'PATCH',
        body: {
          template_id: templateId,
          ...payload
        }
      })

      await loadTemplate()

      router.replace(`${templateId}`)
    } finally {
      saving.value = false
    }
  }

  onMounted(loadTemplate)
</script>

<template>
  <div v-if="loading" class="p-6">Loading...</div>

  <TemplateForm
    v-else
    :mode="mode"
    :initial-data="template"
    :saving="saving"
    @save="updateTemplate"
    @cancel="router.back()"
  />
</template>
