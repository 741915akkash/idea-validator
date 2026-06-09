<script setup>
  import { ChevronDown, ChevronRight } from 'lucide-vue-next'

  const props = defineProps({
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

  const updateType = (type) => {
    props.modelValue.type = type
    emit('update:modelValue', props.modelValue)
  }

  const updateModel = () => {
    emit('update:modelValue', props.modelValue)
  }
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
          <p class="text-[10px] font-bold uppercase tracking-widest text-app-muted">Section 03</p>

          <h3 class="font-bold text-app-text">Offer</h3>
        </div>
      </div>

      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-app-muted" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-app-border p-8 pt-2">
      <div class="flex gap-2">
        <button
          @click="updateType('Product')"
          :class="
            modelValue.type === 'Product'
              ? 'bg-emerald-600 text-white'
              : 'font-bold text-app-muted text-app-text'
          "
          class="flex-1 rounded-xl border border-app-border py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          Product
        </button>

        <button
          @click="updateType('Service')"
          :class="
            modelValue.type === 'Service'
              ? 'bg-emerald-600 text-white'
              : 'font-bold text-app-muted text-app-text'
          "
          class="flex-1 rounded-xl border border-app-border py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          Service
        </button>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1 space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-app-muted">
            Price ($)
          </label>

          <input
            v-model="modelValue.price"
            type="number"
            @input="updateModel"
            class="w-full rounded-xl border border-app-border p-3 text-sm font-semibold text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="col-span-2 space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-app-muted">
            Value Proposition
          </label>

          <input
            v-model="modelValue.value"
            @input="updateModel"
            placeholder="e.g. Free Audit"
            class="w-full rounded-xl border border-app-border p-3 text-sm font-semibold text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>
    </div>
  </div>
</template>
