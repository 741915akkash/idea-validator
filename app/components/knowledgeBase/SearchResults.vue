<script setup>
  import { Search, ArrowRight } from 'lucide-vue-next'

  defineProps({
    searchResults: Array,
    searchQuery: String
  })

  defineEmits(['open'])
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 space-y-12 duration-500">
    <div v-for="section in searchResults" :key="section.category" class="space-y-4">
      <div class="flex items-center gap-3">
        <div
          :class="[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            section.bg,
            section.color
          ]"
        >
          <component :is="section.icon" class="h-3.5 w-3.5" />
        </div>
        <h3 class="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {{ section.category }} ({{ section.items.length }})
        </h3>
      </div>

      <div class="grid gap-2">
        <button
          v-for="item in section.items"
          :key="item.title"
          class="group flex w-full items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/[0.04]"
          @click="$emit('open', item)"
        >
          <div>
            <span
              class="mb-0.5 block text-sm font-bold text-slate-800 group-hover:text-emerald-700"
              >{{ item.title }}</span
            >
            <span class="line-clamp-1 text-xs italic leading-relaxed text-slate-500 opacity-80">{{
              item.snippet
            }}</span>
          </div>
          <ArrowRight
            class="mt-1 h-4 w-4 shrink-0 text-slate-200 transition-all group-hover:translate-x-1 group-hover:text-emerald-500"
          />
        </button>
      </div>
    </div>

    <!-- Empty Search Results Suggestion -->
    <div
      v-if="searchResults.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center text-slate-400"
    >
      <Search class="mb-4 h-12 w-12 opacity-20" />
      <p class="font-medium">No direct matches found</p>
      <p class="text-xs">Try searching for broader keywords like "billing" or "urgency"</p>
    </div>
  </div>
</template>
