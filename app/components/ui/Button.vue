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
    class="inline-block rounded bg-emerald-600 px-6 py-3 text-base font-medium text-white transition hover:bg-emerald-700"
  >
    <slot />
  </NuxtLink>

  <button
    v-else
    class="inline-block rounded bg-emerald-600 px-6 py-3 text-base font-medium text-white transition hover:bg-emerald-700"
  >
    <slot />
  </button>
</template>
