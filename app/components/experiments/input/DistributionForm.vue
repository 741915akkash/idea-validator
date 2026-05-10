<script setup>
  import { ChevronDown, ChevronRight } from 'lucide-vue-next'

  defineProps({
    modelValue: {
      type: Object,
      required: true
    },
    variable: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:modelValue', 'update:variable', 'toggle'])
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
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section 04</p>
          <h3 class="font-bold text-slate-900">Channel</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-slate-300" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-slate-50 p-8 pt-2">
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >Platform</label
        >
        <select
          v-model="modelValue.platform"
          @change="emit('update:modelValue', modelValue)"
          class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option>Reddit</option>
          <option>LinkedIn</option>
          <option>Email</option>
          <option>X (Twitter)</option>
        </select>
      </div>
      <div class="space-y-3">
        <label
          class="mb-2 block text-center text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >Primary Variable Being Tested</label
        >
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            v-for="v in ['Audience', 'Message', 'Offer', 'Channel']"
            :key="v"
            @click="emit('update:variable', v)"
            :class="
              variable === v ? 'bg-emerald-600 text-white' : 'bg-white font-bold text-slate-600'
            "
            class="rounded-xl border border-slate-100 py-3 text-[10px] uppercase tracking-widest transition-all"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
