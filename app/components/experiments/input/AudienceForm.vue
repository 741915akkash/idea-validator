<script setup>
  import { Target, ChevronDown, ChevronRight } from 'lucide-vue-next'

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
    :class="active ? 'ring-2 ring-blue-500/20' : ''"
  >
    <button
      @click="emit('toggle')"
      class="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/50"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-500"
        >
          <Target class="h-5 w-5" />
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section 01</p>
          <h3 class="font-bold text-slate-900">Audience Persona</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-slate-300" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-slate-50 p-8 pt-2">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >Persona Name</label
          >
          <select
            v-model="modelValue.persona"
            @change="emit('update:modelValue', modelValue)"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-blue-500/10"
          >
            <option>SaaS Founders</option>
            <option>Marketing Managers</option>
            <option>Solo Devs</option>
            <option>DevOps Engineers</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >Company Stage</label
          >
          <select
            v-model="modelValue.stage"
            @change="emit('update:modelValue', modelValue)"
            class="border-slate-202 w-full rounded-xl border bg-slate-50 p-3 text-sm font-semibold"
          >
            <option>Seed (0-5k MRR)</option>
            <option>Growth (5k-50k MRR)</option>
            <option>Scale (50k+ MRR)</option>
          </select>
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >Target Industry</label
        >
        <input
          v-model="modelValue.industry"
          @input="emit('update:modelValue', modelValue)"
          placeholder="e.g. Fintech, E-commerce"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold"
        />
      </div>
    </div>
  </div>
</template>
