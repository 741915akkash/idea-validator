<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-6 rounded-lg border border-app-border px-6 py-5 text-app-text">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-app-text">Templates</h1>

        <div class="mt-3 h-1 w-16 bg-emerald-500"></div>

        <p class="mt-2 text-sm text-app-muted">Reusable interview question sets</p>
      </div>
    </div>

    <!-- Filters + Actions -->
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        <button class="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">All</button>

        <button
          class="rounded-full border border-app-border px-4 py-2 text-sm text-app-text hover:bg-app-hover"
        >
          Recently Used
        </button>

        <button
          class="rounded-full border border-app-border px-4 py-2 text-sm text-app-text hover:bg-app-hover"
        >
          Most Interviews
        </button>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-end gap-2">
        <NuxtLink
          to="/quiz/interviews"
          class="inline-flex items-center justify-center rounded-lg border border-app-border bg-app-panel px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-hover"
        >
          Back to Interviews
        </NuxtLink>

        <NuxtLink
          to="/quiz/interview-templates/new"
          class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          + New Template
        </NuxtLink>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search templates..."
        class="w-full rounded-xl border border-app-border bg-app-panel px-4 py-3 text-sm text-app-text outline-none transition focus:border-emerald-500"
      />
    </div>

    <!-- Template Grid -->
    <div
      v-if="loading"
      class="rounded border border-app-border bg-app-panel px-4 py-4 text-sm text-app-muted"
    >
      Loading templates...
    </div>

    <div
      v-else-if="error"
      class="bg-red-500/100/5 rounded border border-red-500/20 px-4 py-4 text-sm text-red-500"
    >
      {{ error }}
    </div>

    <div
      v-else-if="filteredTemplates.length === 0"
      class="rounded border border-app-border bg-app-panel px-4 py-4 text-sm text-app-muted"
    >
      No templates found.
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <!-- Card -->
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="rounded-2xl border border-app-border bg-app-panel p-5 text-app-text transition hover:border-emerald-500/30"
        role="button"
        tabindex="0"
        @click="openTemplate(template.id)"
      >
        <!-- Title -->
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-app-text">
            {{ template.title }}
          </h2>

          <p class="mt-1 text-sm text-app-muted">
            {{ template.description }}
          </p>
        </div>

        <!-- Stats -->
        <div class="mb-5 space-y-2 text-sm text-app-muted">
          <div class="flex items-center justify-between">
            <span>Questions</span>
            <span class="font-medium text-app-text">
              {{ template.questions }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span>Interviews</span>
            <span class="font-medium text-app-text">
              {{ template.interviews }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span>Updated</span>
            <span class="font-medium text-app-text">
              {{ template.updated }}
            </span>
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-5 flex flex-wrap gap-2">
          <span
            v-for="tag in template.tags"
            :key="tag"
            class="rounded-full bg-app-hover px-3 py-1 text-xs font-medium text-app-muted"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-app-border pt-4">
          <button
            @click.stop="openTemplate(template.id, 'edit')"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-app-panel text-app-text transition hover:bg-app-hover"
            aria-label="Edit template"
            title="Edit"
          >
            <PencilLine class="h-4 w-4" />
          </button>

          <button
            @click.stop="openVersions(template.id)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-app-panel text-app-text transition hover:bg-app-hover"
            aria-label="View versions"
            title="Versions"
          >
            <GitBranch class="h-4 w-4" />
          </button>

          <button
            @click.stop="openAnalytics(template.id)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-app-panel text-app-text transition hover:bg-app-hover"
            aria-label="View analytics"
            title="Analytics"
          >
            <BarChart3 class="h-4 w-4" />
          </button>

          <button
            @click.stop="duplicateTemplate(template.id)"
            :disabled="duplicatingId === template.id"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E5E4E2] text-black transition hover:bg-[#DAD8D4] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Duplicate template"
            title="Duplicate"
          >
            <Copy v-if="duplicatingId !== template.id" class="h-4 w-4" />
            <span v-else class="text-[10px] font-medium">...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { BarChart3, Copy, GitBranch, PencilLine } from 'lucide-vue-next'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const templates = ref([])
  const loading = ref(true)
  const error = ref('')
  const searchQuery = ref('')
  const duplicatingId = ref('')

  function normalizeTags(raw) {
    if (Array.isArray(raw)) return raw.filter(Boolean)
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch {
        return raw
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      }
    }
    return []
  }

  function formatUpdated(value) {
    if (!value) return 'Unknown'
    const date = new Date(value)
    if (!Number.isFinite(date.getTime())) return 'Unknown'
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const filteredTemplates = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return templates.value

    return templates.value.filter((template) => {
      const title = String(template.title || '').toLowerCase()
      const description = String(template.description || '').toLowerCase()
      const tags = (template.tags || []).join(' ').toLowerCase()
      return title.includes(q) || description.includes(q) || tags.includes(q)
    })
  })

  function openTemplate(id, mode = 'view') {
    if (!id) return
    const query = mode === 'edit' ? '?mode=edit' : ''
    navigateTo(`/quiz/interview-templates/${id}${query}`)
  }

  function openAnalytics(id) {
    if (!id) return
    const template = templates.value.find((item) => item.id === id)
    const version = template?.version ? `&version=${encodeURIComponent(template.version)}` : ''
    navigateTo(
      `/quiz/interview-templates/analytics?template_id=${encodeURIComponent(id)}${version}`
    )
  }

  function openVersions(id) {
    if (!id) return
    navigateTo(`/quiz/interview-templates/versions?template_id=${encodeURIComponent(id)}`)
  }

  async function duplicateTemplate(id) {
    if (!id || duplicatingId.value) return

    try {
      duplicatingId.value = id

      const res = await $fetch('/api/interview-template/duplicate', {
        method: 'POST',
        body: {
          template_id: id
        }
      })

      const duplicatedId = res?.template_id
      if (duplicatedId) {
        navigateTo(`/quiz/interview-templates/${duplicatedId}?mode=edit`)
      }
    } catch (err) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to duplicate template.'
    } finally {
      duplicatingId.value = ''
    }
  }

  onMounted(async () => {
    try {
      loading.value = true
      error.value = ''

      const res = await $fetch('/api/interview-template/list')
      const rows = Array.isArray(res?.templates) ? res.templates : Array.isArray(res) ? res : []

      templates.value = rows.map((row) => ({
        id: row.id,
        title: row.title || 'Untitled template',
        description: row.description || 'No description',
        questions: Number(row.question_count || 0),
        interviews: Number(row.interview_count || 0),
        version: Number(row.version || 0) || null,
        updated: formatUpdated(row.updated_at),
        tags: normalizeTags(row.tags)
      }))
    } catch (err) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to load templates.'
      templates.value = []
    } finally {
      loading.value = false
    }
  })
</script>
