<script setup>
  import { Zap, ChevronDown, ChevronRight } from 'lucide-vue-next'

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
    :class="active ? 'ring-2 ring-emerald-500/20' : ''"
  >
    <button
      @click="emit('toggle')"
      class="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/50"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-500"
        >
          <Zap class="h-5 w-5" />
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section 04</p>
          <h3 class="font-bold text-slate-900">Channel & Deployment</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-slate-300" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-slate-50 p-8 pt-2">
      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >Platform</label
          >
          <select
            v-model="modelValue.platform"
            @change="emit('update:modelValue', modelValue)"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold"
          >
            <option>Reddit</option>
            <option>LinkedIn</option>
            <option>Email</option>
            <option>X (Twitter)</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >Volume (Contacts)</label
          >
          <input
            type="number"
            v-model="modelValue.volume"
            @input="emit('update:modelValue', modelValue)"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold"
          />
        </div>
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
              variable === v ? 'bg-emerald-600 text-white' : 'bg-slate-50 font-bold text-slate-600'
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
