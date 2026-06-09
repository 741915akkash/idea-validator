<script setup>
  import { TrendingUp, Filter, SortAsc } from 'lucide-vue-next'

  defineProps({
    experiments: {
      type: Array,
      required: true
    }
  })

  const emit = defineEmits(['view'])
</script>

<template>
  <section
    class="overflow-hidden rounded-3xl border border-app-border text-app-text shadow-xl shadow-slate-200/50"
  >
    <div class="flex items-center justify-between border-b border-app-border bg-app-card p-6">
      <div class="flex items-center gap-2 text-sm font-bold text-app-text">
        <TrendingUp class="h-4 w-4 text-app-muted" />
        ACTIVE EXPERIMENTS
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-app-border p-2 text-app-muted text-app-text transition-colors hover:bg-app-card"
        >
          <Filter class="h-4 w-4" />
        </button>
        <button
          class="rounded-lg border border-app-border p-2 text-app-muted text-app-text transition-colors hover:bg-app-card"
        >
          <SortAsc class="h-4 w-4" />
        </button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-app-border text-[10px] font-bold uppercase text-app-muted">
            <th class="px-8 py-5">EXP</th>
            <th class="px-8 py-5">Audience</th>
            <th class="px-8 py-5">Rev</th>
            <th class="px-8 py-5 text-right">CR</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 font-mono text-sm leading-none">
          <tr
            v-for="exp in experiments"
            :key="exp.id"
            @click="emit('view', exp)"
            class="hover:bg-app-card/80 group cursor-pointer transition-colors"
          >
            <td class="px-8 py-6">
              <span
                :class="{
                  'text-nuxt-green': exp.status === 'winning',
                  'text-app-muted': exp.status === 'neutral',
                  'text-red-400': exp.status === 'failing'
                }"
                class="font-bold"
                >#{{ exp.id }}</span
              >
            </td>
            <td class="px-8 py-6 font-semibold italic text-app-text">{{ exp.audience }}</td>
            <td
              class="px-8 py-6 font-bold"
              :class="exp.revenue !== '0' ? 'text-green-600' : 'text-app-muted'"
            >
              ${{ exp.revenue }}
            </td>
            <td class="px-8 py-6 text-right font-bold text-app-text">{{ exp.cr }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
