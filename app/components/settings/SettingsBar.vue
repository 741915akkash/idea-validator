<script setup>
  const props = defineProps({
    title: String,
    subtitle: String,
    danger: Boolean
  })
</script>

<template>
  <div
    class="my-3 flex items-center justify-between rounded-lg border px-4 py-3"
    :class="
      danger ? 'border-rose-500/20 bg-rose-500/5' : 'border-app-border bg-app-panel text-app-text'
    "
  >
    <div>
      <div class="text-sm font-medium" :class="danger ? 'text-rose-500' : 'text-app-text'">
        {{ title }}
      </div>

      <div v-if="subtitle" class="mt-1 text-xs text-app-muted">
        {{ subtitle }}
      </div>
    </div>

    <div>
      <slot />
    </div>
  </div>
</template>
