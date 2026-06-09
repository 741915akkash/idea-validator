<script setup>
  import { Search, ArrowRight } from 'lucide-vue-next'

  defineProps({
    items: Array,
    searchQuery: String
  })

  defineEmits(['open'])
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="mb-12 flex items-center gap-3"></div>

    <div class="grid gap-2">
      <button
        v-for="item in items"
        :key="item.id"
        class="group flex w-full items-start justify-between rounded-2xl border border-app-border bg-app-card p-4 text-left text-app-text transition-all hover:border-emerald-500/40 hover:shadow-xl"
        @click="$emit('open', item)"
      >
        <div>
          <span class="mb-0.5 block text-sm font-bold text-app-text group-hover:text-emerald-500">
            {{ item.title }}
          </span>

          <span class="line-clamp-1 text-xs italic leading-relaxed text-app-muted opacity-80">
            {{ item.content?.length > 180 ? item.content.slice(0, 180) + '...' : item.content }}
          </span>
        </div>

        <ArrowRight
          class="mt-1 h-4 w-4 shrink-0 text-app-muted transition-all group-hover:translate-x-1 group-hover:text-emerald-500"
        />
      </button>
    </div>

    <!-- EMPTY -->
    <div
      v-if="items.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center text-app-muted"
    >
      <Search class="mb-4 h-12 w-12 opacity-20" />

      <p class="font-medium">No matches found</p>

      <p class="text-xs">Try broader keywords or different filters</p>
    </div>
  </div>
</template>
