<script setup>
  import { Brain } from 'lucide-vue-next'

  defineProps({
    suggestions: {
      type: Array,
      required: true
    }
  })

  const emit = defineEmits(['run'])
</script>

<template>
  <section class="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3
      class="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"
    >
      <Brain class="text-nuxt-green h-3 w-3" /> Suggested Experiments
    </h3>
    <div class="grid flex-1 grid-cols-1 gap-4">
      <div
        v-for="s in suggestions"
        :key="s.title"
        class="hover:border-nuxt-green group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all"
      >
        <div>
          <p class="text-nuxt-green mb-1 text-[10px] font-bold uppercase">{{ s.type }}</p>
          <p class="mb-1 text-xs font-semibold leading-tight text-slate-900">{{ s.title }}</p>
          <p class="mb-4 text-[10px] italic text-slate-400">→ {{ s.goal }}</p>
        </div>
        <button
          @click="emit('run')"
          class="group-hover:bg-nuxt-green group-hover:border-nuxt-green w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold uppercase text-slate-600 transition-colors group-hover:text-white"
        >
          Run Experiment
        </button>
      </div>
    </div>
  </section>
</template>
