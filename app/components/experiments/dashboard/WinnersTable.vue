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
  <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div
      class="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 p-6 text-sm font-bold text-slate-900"
    >
      <Trophy class="h-4 w-4 text-orange-400" />
      WINNERS
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
            <th class="px-8 py-4">Category</th>
            <th class="px-8 py-4">Value</th>
            <th class="px-8 py-4">Experiment</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 font-mono text-sm">
          <tr v-for="w in winners" :key="w.label" class="transition-colors hover:bg-slate-50/50">
            <td class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {{ w.label }}
            </td>
            <td class="px-8 py-4 font-bold italic text-slate-900">{{ w.value }}</td>
            <td class="px-8 py-4">
              <span class="text-nuxt-green font-bold">#{{ w.exp }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
