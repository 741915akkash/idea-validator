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
    class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300"
    :class="active ? 'border-slate-300' : ''"
  >
    <button
      @click="emit('toggle')"
      class="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/50"
    >
      <div class="flex items-center gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section 03</p>

          <h3 class="font-bold text-slate-900">Offer</h3>
        </div>
      </div>

      <component :is="active ? ChevronDown : ChevronRight" class="h-5 w-5 text-slate-300" />
    </button>

    <div v-show="active" class="space-y-6 border-t border-slate-50 p-8 pt-2">
      <div class="flex gap-2">
        <button
          @click="updateType('Product')"
          :class="
            modelValue.type === 'Product'
              ? 'bg-emerald-600 text-white'
              : 'bg-white font-bold text-slate-600'
          "
          class="flex-1 rounded-xl border border-slate-100 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          Product
        </button>

        <button
          @click="updateType('Service')"
          :class="
            modelValue.type === 'Service'
              ? 'bg-emerald-600 text-white'
              : 'bg-white font-bold text-slate-600'
          "
          class="flex-1 rounded-xl border border-slate-100 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          Service
        </button>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1 space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Price ($)
          </label>

          <input
            v-model="modelValue.price"
            type="number"
            @input="updateModel"
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div class="col-span-2 space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Value Proposition
          </label>

          <input
            v-model="modelValue.value"
            @input="updateModel"
            placeholder="e.g. Free Audit"
            class="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>
    </div>
  </div>
</template>
