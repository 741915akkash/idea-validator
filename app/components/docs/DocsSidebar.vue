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
        <p
          class="mb-1 rounded bg-slate-700 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100"
        >
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
