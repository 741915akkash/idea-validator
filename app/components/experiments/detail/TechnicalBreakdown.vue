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
  <section class="rounded-2xl border border-app-border p-6 text-app-text shadow-sm">
    <h3 class="mb-6 text-sm font-bold uppercase tracking-widest text-app-text">
      Technical Breakdown
    </h3>
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-app-border py-2">
        <span class="text-xs font-bold uppercase text-app-muted">Channel</span>
        <span class="font-mono text-sm text-app-text">{{ distribution.platform }} DM</span>
      </div>
      <div class="flex items-center justify-between border-b border-app-border py-2">
        <span class="text-xs font-bold uppercase text-app-muted">Total Volume</span>
        <span class="font-mono text-sm font-semibold text-app-text"
          >{{ distribution.volume }} shots</span
        >
      </div>
      <div class="flex items-center justify-between border-b border-app-border py-2">
        <span class="text-xs font-bold uppercase text-app-muted">Rev per Lead</span>
        <span class="font-mono text-sm font-bold text-app-text text-green-600"
          >${{ results.leads > 0 ? Math.round(results.revenue / results.leads) : 0 }}</span
        >
      </div>
    </div>
  </section>
</template>
