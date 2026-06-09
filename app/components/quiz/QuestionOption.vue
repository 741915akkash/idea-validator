<script setup>
  defineProps({
    option: Object,
    selected: Boolean
  })

  const emit = defineEmits(['select'])
</script>

<template>
  <button
    class="w-full rounded border p-3 text-left"
    :class="selected ? 'border-black bg-gray-100' : 'border-app-border'"
    @click="emit('select')"
  >
    {{ option.label }}
  </button>
</template>
