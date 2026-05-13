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
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section 01</p>
          <h3 class="font-bold text-slate-900">Audience</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-slate-300" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-slate-50 p-8 pt-2">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Audience Persona
          </label>
          <input
            v-model="modelValue.persona"
            @input="emit('update:modelValue', modelValue)"
            placeholder="e.g. SaaS Founders"
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Stage
          </label>
          <select
            v-model="modelValue.stage"
            @change="emit('update:modelValue', modelValue)"
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="beginner">beginner</option>
            <option value="active">active</option>
            <option value="advanced">advanced</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Industry
          </label>
          <input
            v-model="modelValue.industry"
            @input="emit('update:modelValue', modelValue)"
            placeholder="e.g. Fintech"
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Geography
          </label>
          <input
            v-model="modelValue.geography"
            @input="emit('update:modelValue', modelValue)"
            placeholder="e.g. US, Canada"
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Notes
        </label>
        <textarea
          v-model="modelValue.notes"
          @input="emit('update:modelValue', modelValue)"
          rows="3"
          placeholder="Extra audience context"
          class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Tags (comma separated)
        </label>
        <input
          v-model="modelValue.tags"
          @input="emit('update:modelValue', modelValue)"
          placeholder="e.g. b2b, early-adopter"
          class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  </div>
</template>
