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
      <div class="absolute inset-0 bg-slate-900/50" @click="close" />

      <!-- Modal -->
      <div
        class="relative z-10 w-full rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
        :class="maxWidth"
      >
        <!-- Content slot -->
        <slot :close="close" />
      </div>
    </div>
  </Teleport>
</template>
