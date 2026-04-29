<!-- /app/components/SidebarItem.vue -->
<script setup>
  defineProps({ item: Object })
</script>

<template>
  <li>
    <NuxtLink
      :to="item._path"
      class="block rounded px-2 py-1 hover:bg-emerald-50"
      active-class="bg-emerald-100 text-emerald-700"
    >
      {{ item.title }}
    </NuxtLink>

    <ul v-if="item.children" class="ml-4 mt-1 space-y-1">
      <DocsSidebarItem v-for="child in item.children" :key="child._path" :item="child" />
    </ul>
  </li>
</template>
