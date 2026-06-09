<script setup>
  import { Plus, Minus, Filter } from 'lucide-vue-next'

  const props = defineProps({
    filterGroups: Array,
    activeFilters: {
      type: Object,
      default: () => ({})
    },
    isOpen: Boolean
  })

  const emit = defineEmits(['toggle-group', 'toggle-filter', 'close'])

  const isChecked = (groupKey, item) => {
    const selected = Array.isArray(props.activeFilters?.[groupKey])
      ? props.activeFilters[groupKey]
      : []
    return selected.includes(item)
  }
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-in-out"
    enter-from-class="w-0 opacity-0"
    enter-to-class="w-60 opacity-100"
    leave-active-class="transition-all duration-300 ease-in-out"
    leave-from-class="w-60 opacity-100"
    leave-to-class="w-0 opacity-0"
  >
    <aside
      v-if="isOpen"
      class="w-60 shrink-0 overflow-hidden rounded-r-2xl border border-app-border bg-app-panel shadow-sm"
    >
      <div class="custom-scrollbar h-full w-60 overflow-y-auto p-6">
        <div class="mb-8 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Filter class="h-3.5 w-3.5 text-app-muted" />
            <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-app-muted">Filters</h3>
          </div>

          <button
            @click="emit('close')"
            class="text-[10px] font-bold uppercase tracking-widest text-app-muted transition-colors hover:text-app-text"
          >
            Close
          </button>
        </div>

        <div v-for="group in filterGroups" :key="group.name" class="mb-4">
          <button
            @click="emit('toggle-group', group.name)"
            class="group flex w-full items-center justify-between py-2 text-sm font-semibold text-app-text transition-colors hover:text-emerald-600"
          >
            <div class="flex items-center gap-2">
              <Plus
                v-if="!group.isOpen"
                class="h-3.5 w-3.5 text-app-muted group-hover:text-emerald-500"
              />

              <Minus v-else class="h-3.5 w-3.5 text-emerald-500" />

              <span>{{ group.name }}</span>
            </div>

            <span
              v-if="!group.isOpen && group.name === 'Checkpoints'"
              class="text-[10px] font-bold text-app-muted"
            >
              {{ group.items?.length || 0 }}
            </span>
          </button>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="group.isOpen" class="ml-5 mt-2 space-y-2">
              <label
                v-for="item in group.items"
                :key="item"
                class="group flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  :checked="isChecked(group.key, item)"
                  @change="emit('toggle-filter', group.key, item)"
                  class="h-4 w-4 rounded border-app-border text-emerald-500 focus:ring-emerald-500/20"
                />

                <span class="text-xs text-app-muted transition-colors group-hover:text-app-text">
                  {{ item }}
                </span>
              </label>
            </div>
          </Transition>
        </div>
      </div>
    </aside>
  </Transition>
</template>
