<script setup>
defineProps({
  option: Object,
  selected: Boolean
})

const emit = defineEmits(['select'])
</script>

<template>
  <button
    class="w-full text-left border rounded p-3"
    :class="selected ? 'border-black bg-gray-100' : 'border-gray-300'"
    @click="emit('select')"
  >
    {{ option.label }}
  </button>
</template>
