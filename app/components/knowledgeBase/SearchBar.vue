<script setup>
  import { Search, ArrowRight } from 'lucide-vue-next'
  import { ref } from 'vue'

  defineProps({
    searchQuery: String,
    activeScope: String,
    scopes: Array,
    isSidebarOpen: Boolean
  })

  const emit = defineEmits(['update:searchQuery', 'update:activeScope', 'toggle-sidebar'])

  const searchInput = ref(null)

  defineExpose({
    focusInput() {
      searchInput.value?.focus()
    }
  })
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col gap-3">
      <!-- SEARCH ROW -->
      <div class="relative w-full">
        <Search
          class="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted transition-colors"
        />

        <input
          ref="searchInput"
          type="text"
          :value="searchQuery"
          @input="emit('update:searchQuery', $event.target.value)"
          placeholder="Search everything..."
          class="w-full rounded-2xl border border-app-border bg-app-card py-3 pl-14 pr-6 text-base text-app-text shadow-sm transition-all placeholder:text-app-muted focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
        />

        <!-- RIGHT ACTION -->
        <div class="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <div
            v-if="!searchQuery"
            class="rounded-lg border border-app-border bg-app-card px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-app-muted"
          >
            Ctrl + K
          </div>

          <button
            v-else
            @click="
              () => {
                emit('update:searchQuery', '')
              }
            "
            class="rounded-lg p-1 text-app-muted transition hover:bg-app-hover hover:text-app-text"
          >
            <ArrowRight class="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>

      <!-- SEARCH SCOPES -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="searchQuery" class="no-scrollbar flex overflow-x-auto pb-1">
          <div class="flex items-center gap-1">
            <button
              v-for="scope in scopes"
              :key="scope"
              @click="emit('update:activeScope', scope)"
              class="shrink-0 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all"
              :class="
                activeScope === scope
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-transparent text-app-muted hover:text-app-text'
              "
            >
              {{ scope }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
