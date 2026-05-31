<template>
  <div class="min-h-screen bg-white p-6">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Template Versions</h1>

            <p class="mt-2 text-sm text-slate-500">Live version history for this template.</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-6 py-4">
          <h2 class="text-lg font-semibold text-slate-900">Versions</h2>
        </div>

        <div v-if="loading" class="px-6 py-8 text-sm text-slate-500">Loading versions...</div>

        <div v-else-if="error" class="px-6 py-8 text-sm text-red-700">
          {{ error }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Version
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Analytics
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Updated
                </th>

              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="version in versions" :key="version.version">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="font-medium text-slate-900">Version {{ version.version }}</div>

                    <span
                      v-if="version.is_current"
                      class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700"
                    >
                      Current
                    </span>
                  </div>

                  <div class="mt-1 text-sm text-slate-500">
                    {{ version.note }}
                  </div>
                </td>

                <!-- Analytics -->
                <td class="px-6 py-4">
                  <button
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    title="View Analytics"
                    @click="openAnalytics(version.version)"
                  >
                    <BarChart3 class="h-4 w-4" />
                  </button>
                </td>

                <td class="px-6 py-4 text-sm text-slate-600">
                  {{ version.updated }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { BarChart3 } from 'lucide-vue-next'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const route = useRoute()
  const templateId = computed(() => String(route.query.template_id || ''))

  const loading = ref(true)
  const error = ref('')
  const versions = ref([])

  function formatDate(value) {
    if (!value) return ''

    const date = new Date(value)

    if (!Number.isFinite(date.getTime())) return ''

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  async function loadVersions() {
    try {
      loading.value = true
      error.value = ''

      if (!templateId.value) {
        throw new Error('template_id is required')
      }

      const res = await $fetch('/api/interview-template/versions/list', {
        query: {
          template_id: templateId.value
        }
      })

      const rows = Array.isArray(res?.versions) ? res.versions : []

      versions.value = rows.map((row) => ({
        version: Number(row.version || 1),
        note: row.is_current ? 'Current template version' : 'Historical snapshot',
        updated: formatDate(row.last_used_at) || 'Never used',
        is_current: Boolean(row.is_current)
      }))
    } catch (err) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to load versions.'

      versions.value = []
    } finally {
      loading.value = false
    }
  }

  function openAnalytics(versionNumber) {
    navigateTo({
      path: '/quiz/interview-templates/analytics',
      query: {
        template_id: templateId.value,
        version: versionNumber
      }
    })
  }

  onMounted(loadVersions)
</script>
