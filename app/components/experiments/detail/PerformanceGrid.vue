<script setup>
  defineProps({
    results: {
      type: Object,
      required: true
    }
  })

  const conversionRate = (results) => {
    if (!results.leads) return 0
    return ((results.conversions / results.leads) * 100).toFixed(1)
  }
</script>

<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-4">
    <div class="rounded-2xl border border-app-border p-6 text-app-text shadow-sm">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-app-muted">Revenue</p>
      <p class="text-2xl font-bold text-app-text">${{ results.revenue }}</p>
    </div>
    <div class="rounded-2xl border border-app-border p-6 text-app-text shadow-sm">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-app-muted">Leads</p>
      <p class="text-2xl font-bold text-app-text">{{ results.leads }}</p>
    </div>
    <div class="rounded-2xl border border-app-border p-6 text-app-text shadow-sm">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-app-muted">Conversions</p>
      <p class="text-2xl font-bold text-app-text">{{ results.conversions }}</p>
    </div>
    <div class="bg-nuxt-green shadow-nuxt-green/20 rounded-2xl p-6 text-white shadow-lg">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/70">Conv. Rate</p>
      <p class="text-2xl font-bold">{{ conversionRate(results) }}%</p>
    </div>
  </section>
</template>
