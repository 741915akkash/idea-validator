<script setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useSequencesStore } from '~/stores/sequences'
  import { useSourcesStore } from '~/stores/sources'
  import { useStagesStore } from '~/stores/stages'
  import { useUsersStore } from '~/stores/users'
  import AddLeadModal from './AddLeadModal.vue'
  import { ChevronLeft, ChevronRight, Columns, Filter, Plus, RotateCcw } from 'lucide-vue-next'

  const props = defineProps({
    table: Object
  })

  const showModal = ref(false)
  const showColumns = ref(false)
  const showFilters = ref(false)
  const activeFilterType = ref('')
  const filterMenuRef = ref(null)
  const viewMenuRef = ref(null)
  const stagesStore = useStagesStore()
  const usersStore = useUsersStore()
  const sourcesStore = useSourcesStore()
  const sequencesStore = useSequencesStore()

  const filterTypes = [
    { id: 'stage_id', label: 'Stage' },
    { id: 'user_id', label: 'Owner' },
    { id: 'source_name', label: 'Source' },
    { id: 'sequence_name', label: 'Sequence' },
    { id: 'created_at', label: 'Created' }
  ]

  const filterLabelMap = {
    stage_id: 'Stage',
    user_id: 'Owner',
    source_name: 'Source',
    sequence_name: 'Sequence',
    created_at: 'Created'
  }

  const activeFilterLabel = computed(() => filterLabelMap[activeFilterType.value] || '')
  const activeFilterOptions = ref([])
  const selectedFilterOptions = ref({
    stage_id: [],
    user_id: [],
    source_name: [],
    sequence_name: [],
    created_at: []
  })
  const selectedFilterPills = computed(() => {
    const filters = props.table?.getState?.()?.columnFilters || []
    const pills = []

    filters.forEach((filter) => {
      const id = filter?.id
      const values = Array.isArray(filter?.value) ? filter.value : [filter?.value]

      values
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
        .forEach((value) => {
          pills.push({
            id,
            value: String(value),
            label: filterLabelMap[id] || id
          })
        })
    })

    return pills
  })

  function openModal() {
    showModal.value = true
  }

  function labelFor(column) {
    return typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id
  }

  function openFilterMenu() {
    showFilters.value = !showFilters.value
    if (!showFilters.value) activeFilterType.value = ''
  }

  function openFilterType(typeId) {
    activeFilterType.value = typeId

    if (typeId === 'stage_id') {
      activeFilterOptions.value = stagesStore.stages
        .map((stage) => stage?.name)
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
        .map((value) => String(value))
      return
    }

    if (typeId === 'user_id') {
      activeFilterOptions.value = usersStore.users
        .map((user) => user?.name || user?.email)
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
        .map((value) => String(value))
      return
    }

    if (typeId === 'source_name') {
      activeFilterOptions.value = sourcesStore.sources
        .map((source) => source?.name)
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
        .map((value) => String(value))
      return
    }

    if (typeId === 'sequence_name') {
      activeFilterOptions.value = sequencesStore.sequences
        .map((sequence) => sequence?.title)
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
        .map((value) => String(value))
      return
    }

    if (typeId === 'created_at') {
      const rows = props.table?.getPreFilteredRowModel?.()?.rows || []
      const dayKeys = rows.map((row) => toDateKey(row.getValue('created_at'))).filter(Boolean)

      activeFilterOptions.value = [...new Set(dayKeys)].sort((a, b) => (a < b ? 1 : -1))
      return
    }

    const column = props.table?.getColumn?.(typeId)
    const faceted = column?.getFacetedUniqueValues?.()

    if (faceted && faceted.size > 0) {
      activeFilterOptions.value = [...faceted.keys()]
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
        .map((value) => String(value))
      return
    }

    const rows = props.table?.getPreFilteredRowModel?.()?.rows || []
    const values = rows
      .map((row) => row.getValue(typeId))
      .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')

    activeFilterOptions.value = [...new Set(values.map((value) => String(value)))]
  }

  function backToFilterList() {
    activeFilterType.value = ''
    activeFilterOptions.value = []
  }

  function isOptionSelected(option) {
    const key = activeFilterType.value
    if (!key) return false
    return selectedFilterOptions.value[key].includes(option)
  }

  function toggleOption(option, checked) {
    const key = activeFilterType.value
    if (!key) return

    const current = selectedFilterOptions.value[key] || []
    const next = checked
      ? [...new Set([...current, option])]
      : current.filter((item) => item !== option)
    selectedFilterOptions.value[key] = next

    const column = props.table?.getColumn?.(key)
    if (!column) return
    column.setFilterValue(next.length ? next : undefined)
  }

  function formatFilterOption(option) {
    if (
      activeFilterType.value !== 'created_at' &&
      !String(option || '').match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return option
    }
    const date = fromDateKey(option)
    if (!date) return option
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    })
  }

  function toDateKey(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  function fromDateKey(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return null
    const [, y, m, d] = match
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  function removeFilterPill(pill) {
    const key = pill.id
    const column = props.table?.getColumn?.(key)
    if (!column) return

    const current = Array.isArray(column.getFilterValue()) ? column.getFilterValue() : []
    const next = current.filter((item) => String(item) !== String(pill.value))
    column.setFilterValue(next.length ? next : undefined)

    if (selectedFilterOptions.value[key]) {
      selectedFilterOptions.value[key] = selectedFilterOptions.value[key].filter(
        (item) => String(item) !== String(pill.value)
      )
    }
  }

  function clearAllFilters() {
    props.table?.resetColumnFilters?.()
    selectedFilterOptions.value = {
      stage_id: [],
      user_id: [],
      source_name: [],
      sequence_name: [],
      created_at: []
    }
  }

  function handleDocumentClick(event) {
    const target = event.target

    if (showFilters.value) {
      const filterRoot = filterMenuRef.value
      if (filterRoot && !filterRoot.contains(target)) {
        showFilters.value = false
        activeFilterType.value = ''
        activeFilterOptions.value = []
      }
    }

    if (showColumns.value) {
      const viewRoot = viewMenuRef.value
      if (viewRoot && !viewRoot.contains(target)) {
        showColumns.value = false
      }
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
  })
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex w-full items-center gap-2">
      <!-- LEFT CONTROLS -->
      <div
        class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
      >
        <input
          type="text"
          placeholder="Search name, email, company, phone, notes..."
          class="w-72 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none"
          :value="props.table.getState().globalFilter ?? ''"
          @input="props.table.setGlobalFilter($event.target.value)"
        />

        <!-- FILTER BUTTON -->
        <div ref="filterMenuRef" class="relative" @click.stop>
          <button
            class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            @click="openFilterMenu"
          >
            <Filter class="h-4 w-4" />
            Filters
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="showFilters"
              class="absolute left-0 top-full z-[70] mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5"
            >
              <template v-if="!activeFilterType">
                <div class="mb-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700">
                  Add Filter
                </div>

                <button
                  v-for="item in filterTypes"
                  :key="item.id"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  @click="openFilterType(item.id)"
                >
                  <span>{{ item.label }}</span>
                  <ChevronRight class="h-4 w-4 text-gray-400" />
                </button>
              </template>

              <template v-else>
                <button
                  class="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  @click="backToFilterList"
                >
                  <ChevronLeft class="h-4 w-4 text-gray-500" />
                  <span>{{ activeFilterLabel }}</span>
                </button>

                <div class="max-h-56 space-y-1 overflow-auto">
                  <label
                    v-for="option in activeFilterOptions"
                    :key="option"
                    class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-emerald-600"
                      :checked="isOptionSelected(option)"
                      @change="toggleOption(option, $event.target.checked)"
                    />
                    <span>{{ formatFilterOption(option) }}</span>
                  </label>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <!-- COLUMN TOGGLE -->
        <div ref="viewMenuRef" class="relative" @click.stop>
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
    </div>

    <div v-if="selectedFilterPills.length" class="flex flex-wrap items-center gap-2">
      <span
        v-for="pill in selectedFilterPills"
        :key="`${pill.id}-${pill.value}`"
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
      >
        <span
          >{{ pill.label }}:
          {{ pill.id === 'created_at' ? formatFilterOption(pill.value) : pill.value }}</span
        >
        <button
          class="text-gray-400 transition-colors hover:text-gray-700"
          @click="removeFilterPill(pill)"
        >
          ×
        </button>
      </span>
      <button
        class="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        @click="clearAllFilters"
      >
        Clear all
      </button>
    </div>

    <AddLeadModal v-if="showModal" @close="showModal = false" />
  </div>
</template>
