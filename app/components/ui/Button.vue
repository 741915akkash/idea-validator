<script setup>
defineProps({
  to: {
    type: String,
    default: null
  }
})
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-block px-6 py-3 text-sm font-medium
           text-white bg-emerald-600
           rounded hover:bg-emerald-700
           transition"
  >
    <slot />
  </NuxtLink>

  <button
    v-else
    class="inline-block px-6 py-3 text-sm font-medium
           text-white bg-emerald-600
           rounded hover:bg-emerald-700
           transition"
  >
    <slot />
  </button>
</template>
