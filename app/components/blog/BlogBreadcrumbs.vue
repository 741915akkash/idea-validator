<script setup>
  import { computed } from 'vue'
  const route = useRoute()

  const segments = computed(() => {
    const allSegments = route.path.split('/').filter(Boolean)
    return allSegments[0] === 'blog' ? allSegments.slice(1) : allSegments
  })
</script>

<template>
  <nav
    class="mx-auto flex max-w-3xl items-center gap-2 px-4 py-6 text-xs font-medium text-app-muted"
  >
    <NuxtLink to="/blog" class="transition-colors hover:text-black">Blog</NuxtLink>

    <template v-for="(seg, i) in segments" :key="i">
      <span class="text-app-muted">/</span>

      <NuxtLink
        :to="'/' + segments.slice(0, i + 1).join('/')"
        :class="[
          'capitalize transition-colors hover:text-black',
          i === segments.length - 1 ? 'pointer-events-none text-app-text' : ''
        ]"
      >
        {{ seg.replace(/-/g, ' ') }}
      </NuxtLink>
    </template>
  </nav>
</template>
