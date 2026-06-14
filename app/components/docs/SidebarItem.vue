<!-- /app/components/SidebarItem.vue -->
<script setup>
  defineProps({ item: Object })
</script>

<template>
  <li>
    <NuxtLink
      :to="item._path"
      class="block rounded px-2 py-1 hover:bg-emerald-500/10"
      active-class="bg-emerald-500/10 text-emerald-500"
    >
      {{ item.title }}
    </NuxtLink>

    <ul v-if="item.children" class="ml-4 mt-1 space-y-1">
      <DocsSidebarItem v-for="child in item.children" :key="child._path" :item="child" />
    </ul>
  </li>
</template>
