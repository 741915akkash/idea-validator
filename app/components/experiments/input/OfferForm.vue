<script setup>
  import { Briefcase, ChevronDown, ChevronRight } from 'lucide-vue-next'

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
    :class="active ? 'ring-2 ring-orange-500/20' : ''"
  >
    <button
      @click="emit('toggle')"
      class="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/50"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500"
        >
          <Briefcase class="h-5 w-5" />
        </div>

        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Section 03</p>

          <h3 class="font-bold text-slate-900">Offer Dynamics</h3>
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
              ? 'bg-orange-600 text-white'
              : 'bg-slate-50 font-bold text-slate-600'
          "
          class="flex-1 rounded-xl border border-slate-100 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          Product
        </button>

        <button
          @click="updateType('Service')"
          :class="
            modelValue.type === 'Service'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-50 font-bold text-slate-600'
          "
          class="flex-1 rounded-xl border border-slate-100 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          Service
        </button>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1 space-y-1.5">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Price (₹)
          </label>

          <input
            v-model="modelValue.price"
            type="number"
            @input="updateModel"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold"
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
            class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold"
          />
        </div>
      </div>
    </div>
  </div>
</template>
