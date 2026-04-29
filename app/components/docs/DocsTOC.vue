<!-- /app/components/DocsToc.vue -->
<script setup>
  import { computed } from 'vue'

  const route = useRoute()
  const currentPath = computed(() => route.path)

  const { data: page } = await useAsyncData(
    () => `docs-toc:${currentPath.value}`,
    () => queryCollection('docs').path(currentPath.value).first(),
    { watch: [currentPath] }
  )
</script>

<template>
  <div v-if="page?.body?.toc?.links?.length">
    <p class="mb-2 text-sm font-semibold text-gray-500">On this page</p>

    <ul class="space-y-2 text-sm">
      <li v-for="link in page.body.toc.links" :key="link.id">
        <a :href="'#' + link.id" class="text-gray-600 hover:text-emerald-600">
          {{ link.text }}
        </a>

        <!-- nested -->
        <ul v-if="link.children" class="ml-4 mt-1 space-y-1">
          <li v-for="child in link.children" :key="child.id">
            <a :href="'#' + child.id" class="text-gray-500 hover:text-emerald-600">
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
