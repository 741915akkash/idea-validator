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
    class="overflow-hidden rounded-3xl border border-app-border text-app-text shadow-sm transition-all duration-300"
    :class="active ? 'border-app-border' : ''"
  >
    <button
      @click="emit('toggle')"
      class="hover:text-app-text/50 flex w-full items-center justify-between p-6 text-left transition-colors"
    >
      <div class="flex items-center gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-app-muted">Section 04</p>
          <h3 class="font-bold text-app-text">Channel</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-app-muted" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-app-border p-8 pt-2">
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-app-muted"
          >Platform</label
        >
        <select
          v-model="modelValue.platform"
          @change="emit('update:modelValue', modelValue)"
          class="w-full rounded-xl border border-app-border p-3 text-sm font-semibold text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option>Reddit</option>
          <option>LinkedIn</option>
          <option>Email</option>
          <option>X (Twitter)</option>
        </select>
      </div>
      <div class="space-y-3">
        <label
          class="mb-2 block text-center text-[10px] font-bold uppercase tracking-widest text-app-muted"
          >Primary Variable Being Tested</label
        >
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            v-for="v in ['Audience', 'Message', 'Offer', 'Channel']"
            :key="v"
            @click="emit('update:variable', v)"
            :class="
              variable === v
                ? 'bg-emerald-600 text-white'
                : 'font-bold text-app-muted text-app-text'
            "
            class="rounded-xl border border-app-border py-3 text-[10px] uppercase tracking-widest transition-all"
          >
            {{ v }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
