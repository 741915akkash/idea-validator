<script setup>
  import { computed } from 'vue'

  // 🔥 add emit
  const emit = defineEmits(['navigate'])

  const { data: pages } = await useAsyncData('docs-sidebar-pages', async () => {
    const docs = await queryCollection('docs').select('path', 'title').all()
    return docs
      .filter((doc) => typeof doc.path === 'string' && doc.path.startsWith('/docs'))
      .sort((a, b) => a.path.localeCompare(b.path))
  })

  function titleFromSlug(slug = '') {
    return slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const rootPage = computed(() => pages.value?.find((page) => page.path === '/docs') || null)

  const sections = computed(() => {
    const bySection = new Map()

    for (const page of pages.value || []) {
      if (!page?.path || page.path === '/docs') continue

      const parts = page.path.split('/').filter(Boolean)
      if (parts.length < 3) continue

      const sectionSlug = parts[1]
      const sectionTitle = titleFromSlug(sectionSlug)
      const pageSlug = parts[parts.length - 1]
      const pageTitle = page.title || titleFromSlug(pageSlug)

      if (!bySection.has(sectionSlug)) {
        bySection.set(sectionSlug, {
          slug: sectionSlug,
          title: sectionTitle,
          items: []
        })
      }

      bySection.get(sectionSlug).items.push({
        path: page.path,
        title: pageTitle
      })
    }

    return Array.from(bySection.values())
  })
</script>

<template>
  <!-- 🔥 single handler instead of adding click everywhere -->
  <div @click="emit('navigate')">
    <div class="mb-4">
      <input placeholder="Search..." class="w-full rounded-md border px-3 py-2 text-sm" />
    </div>

    <div class="space-y-4">
      <NuxtLink
        v-if="rootPage"
        :to="rootPage.path"
        class="block rounded px-2 py-1 text-sm hover:bg-emerald-50"
        active-class="bg-emerald-100 text-emerald-700"
        exact-active-class="bg-emerald-100 text-emerald-700"
      >
        {{ rootPage.title || 'Docs' }}
      </NuxtLink>

      <div v-for="section in sections" :key="section.slug">
        <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {{ section.title }}
        </p>

        <ul class="space-y-1">
          <li v-for="item in section.items" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="block rounded px-2 py-1 text-sm hover:bg-emerald-50"
              active-class="bg-emerald-100 text-emerald-700"
              exact-active-class="bg-emerald-100 text-emerald-700"
            >
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
