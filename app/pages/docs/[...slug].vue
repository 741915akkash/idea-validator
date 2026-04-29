<!-- /app/pages/docs/[...slug].vue -->
<script setup>
  import { computed } from 'vue'

  definePageMeta({
    layout: 'docs'
  })

  const route = useRoute()
  const currentPath = computed(() => route.path)

  const { data: page } = await useAsyncData(
    () => `docs-page:${currentPath.value}`,
    () => queryCollection('docs').path(currentPath.value).first(),
    { watch: [currentPath] }
  )
</script>

<template>
  <article
    class="prose prose-slate prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:decoration-0 [&_h1_a]:text-slate-900 [&_h2_a]:text-slate-900 [&_h3_a]:text-slate-900"
  >
    <template v-if="page">
      <ContentRenderer :value="page" />
    </template>

    <div v-else class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
      This documentation page is missing. Choose a page from the sidebar.
    </div>
  </article>
</template>
