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
    class="prose max-w-none prose-headings:font-semibold prose-headings:text-app-text prose-headings:decoration-0 prose-p:text-app-text prose-a:text-emerald-500 hover:prose-a:text-emerald-400 prose-blockquote:text-app-muted prose-strong:text-app-text prose-code:text-emerald-500 prose-li:text-app-text prose-th:text-app-text prose-td:text-app-text [&_h1_a]:text-app-text [&_h2_a]:text-app-text [&_h3_a]:text-app-text"
  >
    <template v-if="page">
      <ContentRenderer :value="page" />
    </template>

    <div v-else class="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-amber-500">
      This documentation page is missing. Choose a page from the sidebar.
    </div>
  </article>
</template>
