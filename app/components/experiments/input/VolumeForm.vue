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
    class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300"
    :class="active ? 'border-slate-300' : ''"
  >
    <button
      @click="emit('toggle')"
      class="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/50"
    >
      <div class="flex items-center gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section 05</p>
          <h3 class="font-bold text-slate-900">Volume</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-slate-300" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-slate-50 p-8 pt-2">
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Actions Taken
        </label>
        <input
          type="number"
          min="0"
          v-model="modelValue.actions_taken"
          @input="emit('update:modelValue', modelValue)"
          class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  </div>
</template>
