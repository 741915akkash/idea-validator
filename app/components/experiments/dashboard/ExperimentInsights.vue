<script setup>
  import { LineChart } from 'lucide-vue-next'

  defineProps({
    insights: {
      type: Array,
      required: true
    }
  })
</script>

<template>
  <section class="flex flex-col rounded-3xl border border-app-border p-6 text-app-text shadow-sm">
    <h3
      class="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-app-muted"
    >
      <LineChart class="h-3 w-3 text-emerald-600" />
      Insights
    </h3>

    <ul class="space-y-3">
      <li
        v-for="insight in insights"
        :key="insight"
        class="rounded-xl border border-app-border bg-app-card px-4 py-3 text-sm text-app-text"
      >
        {{ insight }}
      </li>
    </ul>
  </section>
</template>
