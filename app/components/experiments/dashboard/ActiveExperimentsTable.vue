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
    class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
  >
    <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
      <div class="flex items-center gap-2 text-sm font-bold text-slate-900">
        <TrendingUp class="h-4 w-4 text-slate-400" />
        ACTIVE EXPERIMENTS
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50"
        >
          <Filter class="h-4 w-4" />
        </button>
        <button
          class="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50"
        >
          <SortAsc class="h-4 w-4" />
        </button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
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
            class="group cursor-pointer transition-colors hover:bg-slate-50/80"
          >
            <td class="px-8 py-6">
              <span
                :class="{
                  'text-nuxt-green': exp.status === 'winning',
                  'text-slate-400': exp.status === 'neutral',
                  'text-red-400': exp.status === 'failing'
                }"
                class="font-bold"
                >#{{ exp.id }}</span
              >
            </td>
            <td class="px-8 py-6 font-semibold italic text-slate-900">{{ exp.audience }}</td>
            <td
              class="px-8 py-6 font-bold"
              :class="exp.revenue !== '0' ? 'text-green-600' : 'text-slate-300'"
            >
              ${{ exp.revenue }}
            </td>
            <td class="px-8 py-6 text-right font-bold text-slate-900">{{ exp.cr }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
