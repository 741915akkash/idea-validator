<script setup>
  import { ref } from 'vue'
  import AddLeadModal from './AddLeadModal.vue'
  import { Filter, Columns, Plus, RotateCcw } from 'lucide-vue-next'

  const props = defineProps({
    table: Object
  })

  const showModal = ref(false)
  const showColumns = ref(false)

  function openModal() {
    showModal.value = true
  }

  function labelFor(column) {
    return typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id
  }
</script>

<template>
  <div class="flex w-full items-center gap-2">
    <!-- LEFT CONTROLS -->
    <div class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      <!-- FILTER BUTTON -->
      <button
        class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        @click="props.table.resetColumnFilters()"
      >
        <Filter class="h-4 w-4" />
        Filters
      </button>

      <!-- COLUMN TOGGLE -->
      <div class="relative">
        <button
          class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          @click="showColumns = !showColumns"
        >
          <Columns class="h-4 w-4" />
          View
        </button>

        <!-- DROPDOWN -->
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="showColumns"
            class="absolute left-0 top-full z-[70] mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-xl ring-1 ring-black ring-opacity-5"
          >
            <h3 class="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              Display Columns
            </h3>

            <div class="space-y-1">
              <label
                v-for="column in props.table.getAllLeafColumns()"
                :key="column.id"
                class="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  :checked="column.getIsVisible()"
                  :disabled="!column.getCanHide()"
                  @change="column.toggleVisibility($event.target.checked)"
                  class="h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />

                <span
                  class="text-sm font-medium text-gray-700 transition-colors group-hover:text-emerald-600"
                >
                  {{ labelFor(column) }}
                </span>
              </label>
            </div>

            <div
              class="mt-3 border-t border-gray-100 pt-3 text-center text-[10px] italic text-gray-400"
            >
              Changes auto-save to browser
            </div>
          </div>
        </Transition>
      </div>

      <!-- RESET SORT -->
      <button
        @click="props.table.resetSorting()"
        title="Reset Sorting"
        class="rounded-md p-1.5 text-gray-400 transition-all hover:bg-gray-50 hover:text-emerald-600"
      >
        <RotateCcw class="h-4 w-4" />
      </button>
    </div>

    <!-- ADD BUTTON -->
    <button
      class="ml-auto flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
      @click="openModal"
    >
      <Plus class="h-4 w-4" />
      <span>Add Lead</span>
    </button>

    <AddLeadModal v-if="showModal" @close="showModal = false" />
  </div>
</template>
