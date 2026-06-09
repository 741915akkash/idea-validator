<script setup>
  const props = defineProps({
    modelValue: Boolean,
    maxWidth: {
      type: String,
      default: 'max-w-md'
    }
  })

  const emit = defineEmits(['update:modelValue'])

  function close() {
    emit('update:modelValue', false)
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Overlay -->
      <div
  class="absolute inset-0 bg-black/50 backdrop-blur-sm"
  @click="close"
/>

      <!-- Modal -->
      <div
        class="relative z-10 w-full rounded-lg border border-app-border bg-app-panel p-5 text-app-text"
        :class="maxWidth"
      >
        <!-- Content slot -->
        <slot :close="close" />
      </div>
    </div>
  </Teleport>
</template>
