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
          <p class="text-[10px] font-bold uppercase tracking-widest text-app-muted">Section 02</p>
          <h3 class="font-bold text-app-text">Message</h3>
        </div>
      </div>
      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-app-muted" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-app-border p-8 pt-2">
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-app-muted"
          >Core Pain Point</label
        >
        <input
          v-model="modelValue.pain"
          @input="emit('update:modelValue', modelValue)"
          placeholder="e.g. High cost per lead"
          class="w-full rounded-xl border border-app-border p-3 text-sm font-semibold text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
      <div class="space-y-3">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-app-muted"
          >Psychological Angle</label
        >
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            v-for="a in ['Fear', 'Speed', 'Logic', 'Status']"
            :key="a"
            @click="
              () => {
                modelValue.angle = a
                emit('update:modelValue', modelValue)
              }
            "
            :class="
              modelValue.angle === a
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-app-border text-app-muted text-app-text'
            "
            class="rounded-xl border-2 py-3 text-xs font-bold uppercase tracking-wider transition-all"
          >
            {{ a }}
          </button>
        </div>
      </div>
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold uppercase tracking-widest text-app-muted"
          >Hook Sentence</label
        >
        <textarea
          v-model="modelValue.hook"
          @input="emit('update:modelValue', modelValue)"
          rows="2"
          class="w-full rounded-xl border border-app-border p-3 text-sm font-semibold text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Enter your first line..."
        ></textarea>
      </div>
    </div>
  </div>
</template>
