<script setup>
  import { computed } from 'vue'

  // 🔥 add emit
  const emit = defineEmits(['navigate'])

  const { data: navigation } = await useAsyncData('docs-sidebar-navigation', () =>
    queryCollectionNavigation('docs')
  )

  function collectLeafPages(nodes = []) {
    const out = []
    for (const node of nodes) {
      if (!node) continue
      if (Array.isArray(node.children) && node.children.length) {
        out.push(...collectLeafPages(node.children))
      } else if (node.path && node.path !== '/docs') {
        out.push({ path: node.path, title: node.title || 'Untitled' })
      }
    }
    return out
  }

  const rootPage = computed(() => {
    const nodes = navigation.value || []
    return nodes.find((page) => page?.path === '/docs') || null
  })

  const sections = computed(() => {
    const nodes = navigation.value || []
    const root = nodes.find((n) => n?.path === '/docs')
    const topLevel = root?.children || nodes.filter((n) => n?.path !== '/docs')

    return topLevel
      .filter((section) => section?.path)
      .map((section) => ({
        slug: section.path,
        title: section.title || 'Section',
        items: collectLeafPages(section.children || [])
      }))
      .filter((section) => section.items.length > 0)
  })
</script>

<template>
  <!-- 🔥 single handler instead of adding click everywhere -->
  <div @click="emit('navigate')">
    <div class="mb-4">
      <input
        placeholder="Search..."
        class="w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-emerald-500 focus:outline-none"
      />
    </div>

    <div class="space-y-4">
      <NuxtLink
        v-if="rootPage"
        :to="rootPage.path"
        class="block rounded px-2 py-1 text-sm text-app-muted transition hover:bg-emerald-500/10 hover:text-app-text"
        active-class="bg-emerald-500/10 text-emerald-500"
        exact-active-class="bg-emerald-500/10 text-emerald-500"
      >
        {{ rootPage.title || 'Docs' }}
      </NuxtLink>

      <div v-for="section in sections" :key="section.slug">
        <p class="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-app-muted">
          {{ section.title }}
        </p>

        <ul class="space-y-1">
          <li v-for="item in section.items" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="block rounded px-2 py-1 text-sm text-app-muted transition hover:bg-emerald-500/10 hover:text-app-text"
              active-class="bg-emerald-500/10 text-emerald-500"
              exact-active-class="bg-emerald-500/10 text-emerald-500"
            >
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
