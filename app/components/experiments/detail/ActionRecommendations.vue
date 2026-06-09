<script setup>
  defineProps({
    recommendations: {
      type: Array,
      default: () => [
        {
          title: 'Double down on Reddit',
          description: 'CONV at 20% is 2x benchmark for SaaS Founders.',
          type: 'Scale'
        },
        {
          title: 'Test higher price point',
          description: 'High CR suggests demand inelasticity. Try $79.',
          type: 'Optimize'
        }
      ]
    }
  })
</script>

<template>
  <section class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
    <h3 class="mb-6 text-sm font-bold uppercase tracking-widest text-app-muted">
      Action Recommendations
    </h3>
    <div class="space-y-3">
      <div
        v-for="rec in recommendations"
        :key="rec.title"
        class="text-app-text/5 hover:text-app-text/10 group cursor-pointer rounded-xl border border-white/10 p-3 transition-colors"
      >
        <p
          class="mb-1 text-xs font-semibold"
          :class="rec.type === 'Optimize' ? 'text-purple-300' : ''"
        >
          {{ rec.title }}
        </p>
        <p class="mb-3 text-[10px] text-app-muted">{{ rec.description }}</p>
        <div class="flex justify-end">
          <button class="text-nuxt-green text-[10px] font-bold uppercase group-hover:underline">
            Scale Up
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
