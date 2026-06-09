<script setup>
  import { Trophy } from 'lucide-vue-next'

  defineProps({
    winners: {
      type: Array,
      required: true
    }
  })
</script>

<template>
  <section class="overflow-hidden rounded-3xl border border-app-border text-app-text shadow-sm">
    <div
      class="flex items-center gap-2 border-b border-app-border bg-app-card p-6 text-sm font-bold text-app-text"
    >
      <Trophy class="h-4 w-4 text-orange-400" />
      WINNERS
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-app-border text-[10px] font-bold uppercase text-app-muted">
            <th class="px-8 py-4">Category</th>
            <th class="px-8 py-4">Value</th>
            <th class="px-8 py-4">Experiment</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 font-mono text-sm">
          <tr v-for="w in winners" :key="w.label" class="transition-colors hover:bg-app-card">
            <td class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-app-muted">
              {{ w.label }}
            </td>
            <td class="px-8 py-4 font-bold italic text-app-text">{{ w.value }}</td>
            <td class="px-8 py-4">
              <span class="text-nuxt-green font-bold">#{{ w.exp }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
