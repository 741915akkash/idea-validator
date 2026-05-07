<script setup>
  defineProps({
    distribution: {
      type: Object,
      required: true
    },
    results: {
      type: Object,
      required: true
    }
  })
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 class="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">
      Technical Breakdown
    </h3>
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-slate-50 py-2">
        <span class="text-xs font-bold uppercase text-slate-400">Channel</span>
        <span class="font-mono text-sm text-slate-900">{{ distribution.platform }} DM</span>
      </div>
      <div class="flex items-center justify-between border-b border-slate-50 py-2">
        <span class="text-xs font-bold uppercase text-slate-400">Total Volume</span>
        <span class="font-mono text-sm font-semibold text-slate-900"
          >{{ distribution.volume }} shots</span
        >
      </div>
      <div class="flex items-center justify-between border-b border-slate-50 py-2">
        <span class="text-xs font-bold uppercase text-slate-400">Rev per Lead</span>
        <span class="font-mono text-sm font-bold text-green-600 text-slate-900"
          >₹{{ results.leads > 0 ? Math.round(results.revenue / results.leads) : 0 }}</span
        >
      </div>
    </div>
  </section>
</template>
