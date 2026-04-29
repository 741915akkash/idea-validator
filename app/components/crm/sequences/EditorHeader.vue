<script setup>
  import { ArrowLeft, Save } from 'lucide-vue-next'

  defineProps({
    isEdit: Boolean
  })

  defineEmits(['back', 'save'])
</script>

<template>
  <header class="mb-10 flex items-center justify-between">
    <div class="flex items-center gap-5">
      <button
        @click="$emit('back')"
        class="rounded-2xl border border-gray-100 bg-white p-3 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
      <div>
        <h1 class="text-2xl font-black tracking-tight text-gray-900">
          {{ isEdit ? 'Edit Sequence' : 'Create Sequence' }}
        </h1>
        <p class="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Workflow builder
        </p>
      </div>
    </div>
    <button
      @click="$emit('save')"
      class="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-95"
    >
      <Save class="h-4 w-4" /> Save Sequence
    </button>
  </header>
</template>
