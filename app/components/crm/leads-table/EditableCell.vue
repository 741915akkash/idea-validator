<script setup>
  const props = defineProps({
    value: [String, Number],
    lead: Object
  })

  const emit = defineEmits(['open'])

  function handleClick() {
    emit('open', props.lead)
  }
</script>

<template>
  <div
    @click="handleClick"
    class="flex h-full min-h-[1.75rem] w-full cursor-pointer items-center truncate rounded-md px-2 py-1 text-gray-800 hover:bg-gray-50"
  >
    {{ value || '—' }}
  </div>
</template>
