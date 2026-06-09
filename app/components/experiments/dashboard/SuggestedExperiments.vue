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
  <section class="flex flex-col rounded-3xl border border-app-border p-6 text-app-text shadow-sm">
    <h3
      class="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-app-muted"
    >
      <Brain class="text-nuxt-green h-3 w-3" /> Suggested Experiments
    </h3>
    <div class="grid flex-1 grid-cols-1 gap-4">
      <div
        v-for="s in suggestions"
        :key="s.title"
        class="hover:border-nuxt-green group flex cursor-pointer flex-col justify-between rounded-2xl border border-app-border bg-app-card p-4 transition-all"
      >
        <div>
          <p class="text-nuxt-green mb-1 text-[10px] font-bold uppercase">{{ s.type }}</p>
          <p class="mb-1 text-xs font-semibold leading-tight text-app-text">{{ s.title }}</p>
          <p class="mb-4 text-[10px] italic text-app-muted">→ {{ s.goal }}</p>
        </div>
        <button
          @click="emit('run')"
          class="group-hover:bg-nuxt-green group-hover:border-nuxt-green w-full rounded-lg border border-app-border py-2 text-xs font-bold uppercase text-app-muted text-app-text transition-colors group-hover:text-white"
        >
          Run Experiment
        </button>
      </div>
    </div>
  </section>
</template>
