<script setup>
  import { Search, ArrowRight, Filter } from 'lucide-vue-next'
  import { ref } from 'vue'

  const props = defineProps({
    searchQuery: String,
    activeScope: String,
    scopes: Array,
    isSidebarOpen: Boolean
  })

  const emit = defineEmits(['update:searchQuery', 'update:activeScope', 'toggle-sidebar'])

  const searchInput = ref(null)
  defineExpose({ focusSearch: () => searchInput.value?.focus() })
</script>

<template>
  <div class="sticky top-0 z-10 shrink-0 space-y-4 border-b border-slate-200 px-6 py-4">
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-4">
        <button
          @click="emit('toggle-sidebar')"
          class="group relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition-all hover:bg-slate-100"
          :class="{ 'border-emerald-200 bg-white text-emerald-600': isSidebarOpen }"
        >
          <Filter class="h-5 w-5" />
          <div
            v-if="!isSidebarOpen"
            class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
          ></div>
        </button>

        <div class="group relative flex-1">
          <Search
            class="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500"
          />
          <input
            type="text"
            ref="searchInput"
            :value="searchQuery"
            @input="emit('update:searchQuery', $event.target.value)"
            placeholder="Search everything..."
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-14 pr-6 text-base shadow-sm text-slate-900 shadow-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
          />

          <div class="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <div
              v-if="!searchQuery"
              class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-400"
            >
              Ctrl + K
            </div>
            <button
              v-else
              @click="emit('update:searchQuery', '')"
              class="rounded-lg p-1 text-slate-400 transition-all hover:bg-slate-100"
            >
              <ArrowRight class="h-4 w-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="searchQuery"
        class="no-scrollbar animate-in fade-in slide-in-from-top-1 flex items-center gap-1 overflow-x-auto pb-1 duration-200"
      >
        <button
          v-for="scope in scopes"
          :key="scope"
          @click="emit('update:activeScope', scope)"
          class="shrink-0 rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all"
          :class="
            activeScope === scope
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
          "
        >
          {{ scope }}
        </button>
      </div>
    </div>
  </div>
</template>
