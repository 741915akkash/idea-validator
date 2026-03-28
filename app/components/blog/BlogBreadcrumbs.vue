<script setup>
  import { computed } from 'vue'
  const route = useRoute()

  const segments = computed(() => {
    return route.path.split('/').filter(Boolean)
  })
</script>

<template>
  <nav
    class="mx-auto flex max-w-3xl items-center gap-2 px-4 py-6 text-xs font-medium text-gray-400"
  >
    <NuxtLink to="/" class="transition-colors hover:text-black">Home</NuxtLink>

    <template v-for="(seg, i) in segments" :key="i">
      <span class="text-gray-300">/</span>

      <NuxtLink
        :to="'/' + segments.slice(0, i + 1).join('/')"
        :class="[
          'capitalize transition-colors hover:text-black',
          i === segments.length - 1 ? 'pointer-events-none text-gray-900' : ''
        ]"
      >
        {{ seg.replace(/-/g, ' ') }}
      </NuxtLink>
    </template>
  </nav>
</template>
