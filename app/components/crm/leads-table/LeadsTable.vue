<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useLeadsStore } from '~/stores/leads'
  import {
    FlexRender,
    useVueTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel
  } from '@tanstack/vue-table'

  import TableToolbar from './TableToolbar.vue'
  import { columns } from './columns'
  import LeadDetailPanel from '../lead-detail/LeadDetailPanel.vue'

  const store = useLeadsStore()
  const columnVisibility = ref({
    user_id: false
  })
  const sorting = ref([])
  const searchQuery = ref('')
  const columnSizing = ref({})
  const EMPTY_ROW_COUNT = 30

  const data = computed(() => store.leads)
  const emptyRowCount = computed(() =>
    Math.max(0, EMPTY_ROW_COUNT - table.getRowModel().rows.length)
  )

  const selectedLeadId = ref(null)
  const showDetail = ref(false)

  function openLead(lead) {
    selectedLeadId.value = lead.id
    showDetail.value = true
  }

  function closeLead() {
    showDetail.value = false
    selectedLeadId.value = null
  }

  onMounted(() => {
    const savedVisibility = localStorage.getItem('lead-table-columns')
    const savedSizing = localStorage.getItem('crm-column-widths')

    if (savedVisibility) {
      try {
        columnVisibility.value = JSON.parse(savedVisibility)
      } catch {
        columnVisibility.value = {
          user_id: false
        }
      }
    }

    if (savedSizing) {
      try {
        columnSizing.value = JSON.parse(savedSizing)
      } catch {
        columnSizing.value = {}
      }
    }
  })

  watch(
    columnVisibility,
    (value) => {
      localStorage.setItem('lead-table-columns', JSON.stringify(value))
    },
    { deep: true }
  )

  watch(
    columnSizing,
    (value) => {
      localStorage.setItem('crm-column-widths', JSON.stringify(value))
    },
    { deep: true }
  )

  const table = useVueTable({
    get data() {
      return store.leads
    },
    columns,
    defaultColumn: {
      minSize: 120,
      maxSize: 600
    },
    state: {
      get sorting() {
        return sorting.value
      },
      get columnVisibility() {
        return columnVisibility.value
      },
      get globalFilter() {
        return searchQuery.value
      },
      get columnSizing() {
        return columnSizing.value
      }
    },
    onSortingChange: (updater) => {
      sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
    },
    onColumnVisibilityChange: (updater) => {
      columnVisibility.value =
        typeof updater === 'function' ? updater(columnVisibility.value) : updater
    },
    onGlobalFilterChange: (updater) => {
      searchQuery.value =
        typeof updater === 'function' ? updater(searchQuery.value) : String(updater ?? '')
    },
    onColumnSizingChange: (updater) => {
      columnSizing.value = typeof updater === 'function' ? updater(columnSizing.value) : updater
    },
    columnResizeMode: 'onChange',
    globalFilterFn: (row, _columnId, filterValue) => {
      const term = String(filterValue || '')
        .toLowerCase()
        .trim()
      if (!term) return true

      const lead = row.original || {}
      const searchable = [lead.name, lead.email, lead.company, lead.phone, lead.activities_text]
        .map((value) => String(value || '').toLowerCase())
        .join(' ')

      return searchable.includes(term)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })
</script>

<template>
  <div class="h-full overflow-auto">
    <!-- TABLE WRAPPER -->
    <div
      class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm"
    >
      <!-- TOP BAR -->
      <div class="overflow-x-auto border-b border-gray-100 bg-gray-50/50">
        <div class="min-w-max p-4">
          <TableToolbar :table="table" />
        </div>
      </div>

      <!-- TABLE -->
      <div class="custom-scrollbar flex-1 overflow-auto bg-white">
        <table
          class="w-full table-fixed border-separate border-spacing-0 text-sm"
          :style="{ width: `${table.getTotalSize()}px` }"
        >
          <!-- HEADER -->
          <thead class="bg-gray-50">
            <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <th
                v-for="(header, index) in headerGroup.headers"
                :key="header.id"
                :style="{ width: `${header.getSize()}px`, minWidth: `${header.getSize()}px` }"
                class="group sticky top-0 z-20 overflow-hidden border-b border-gray-200 px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500"
              >
                <div
                  class="group/header flex items-center gap-1.5"
                  :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
                  @click="header.column.getCanSort() && header.column.toggleSorting()"
                >
                  <div class="truncate">
                    <FlexRender
                      v-if="!header.isPlaceholder"
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </div>

                  <!-- SORT ICON -->
                  <div
                    v-if="header.column.getCanSort()"
                    class="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover/header:opacity-100"
                  >
                    <span
                      v-if="header.column.getIsSorted() === 'asc'"
                      class="text-[8px] text-emerald-600"
                      >▲</span
                    >
                    <span
                      v-else-if="header.column.getIsSorted() === 'desc'"
                      class="text-[8px] text-emerald-600"
                      >▼</span
                    >
                    <span v-else class="text-[8px] text-gray-300">▲</span>
                  </div>
                </div>

                <!-- RESIZER -->
                <div
                  v-if="header.column.getCanResize()"
                  class="absolute -right-[1px] top-0 z-40 h-full w-[4px] cursor-col-resize transition-colors hover:bg-emerald-500/30"
                  @mousedown.stop="header.getResizeHandler()($event)"
                  @touchstart.stop="header.getResizeHandler()($event)"
                >
                  <div
                    class="absolute right-0 top-0 h-full w-[1px] bg-gray-200 transition-colors"
                    :class="header.column.getIsResizing() ? 'w-[2px] bg-emerald-500' : ''"
                  />
                </div>
              </th>
            </tr>
          </thead>

          <!-- BODY -->
          <tbody>
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              @click="openLead(row.original)"
              class="group h-[44px] cursor-pointer transition-all duration-200 hover:bg-gray-100/80 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]"
            >
              <td
                v-for="(cell, index) in row.getVisibleCells()"
                :key="cell.id"
                :style="{
                  width: `${cell.column.getSize()}px`,
                  minWidth: `${cell.column.getSize()}px`
                }"
                class="overflow-hidden border-b border-slate-100 px-5 py-2 text-gray-700 transition-colors duration-150"
              >
                <FlexRender
                  v-if="cell.column.columnDef.cell"
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />

                <template v-else>
                  {{ cell.getValue() }}
                </template>
              </td>
            </tr>

            <!-- EMPTY ROWS -->
            <tr v-for="rowIndex in emptyRowCount" :key="`empty-${rowIndex}`" class="group h-[44px]">
              <td
                v-for="(column, index) in table.getVisibleLeafColumns()"
                :key="`empty-${rowIndex}-${column.id}`"
                :style="{ width: `${column.getSize()}px`, minWidth: `${column.getSize()}px` }"
                class="overflow-hidden border-b border-slate-100 px-5 py-2"
              >
                &nbsp;
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <LeadDetailPanel v-if="showDetail" :leadId="selectedLeadId" @close="closeLead" />
  </div>
</template>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
</style>
