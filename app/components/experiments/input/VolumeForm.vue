<script setup>
  import { ChevronDown, ChevronRight } from 'lucide-vue-next'

  defineProps({
    modelValue: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:modelValue', 'toggle'])
</script>

<template>
  <div
    class="overflow-hidden rounded-3xl border border-app-border text-app-text shadow-sm transition-all duration-300"
    :class="active ? 'border-app-border' : ''"
  >
    <button
      @click="emit('toggle')"
      class="hover:text-app-text/50 flex w-full items-center justify-between p-6 text-left transition-colors"
    >
      <div class="flex items-center gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-app-muted">Section 05</p>
          <h3 class="font-bold text-app-text">Volume</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-app-muted" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-app-border p-8 pt-2">
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-app-muted">
          Actions Taken
        </label>
        <input
          type="number"
          min="0"
          v-model="modelValue.actions_taken"
          @input="emit('update:modelValue', modelValue)"
          class="w-full rounded-xl border border-app-border p-3 text-sm font-semibold text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  </div>
</template>
