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
    :class="danger ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'"
  >
    <div>
      <div class="text-sm font-medium" :class="danger ? 'text-rose-800' : 'text-slate-700'">
        {{ title }}
      </div>

      <div v-if="subtitle" class="mt-1 text-xs text-slate-500">
        {{ subtitle }}
      </div>
    </div>

    <div>
      <slot />
    </div>
  </div>
</template>
