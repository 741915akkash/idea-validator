import { h } from 'vue'
import EditableCell from './EditableCell.vue'
import StageCell from './StageCell.vue'

function toDateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const columns = [
  {
    accessorKey: 'name',
    header: () =>
      h('span', { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'Name'),
    enableHiding: false,
    enableSorting: true,
    size: 220,
    minSize: 160,
    cell: (info) =>
      h(EditableCell, {
        value: info.getValue(),
        field: 'name',
        lead: info.row.original
      })
  },

  {
    accessorKey: 'company',
    header: () =>
      h(
        'span',
        { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' },
        'Company'
      ),
    enableSorting: true,
    size: 200,
    minSize: 160,
    cell: (info) =>
      h(EditableCell, {
        value: info.getValue(),
        field: 'company',
        lead: info.row.original
      })
  },

  {
    accessorKey: 'email',
    header: () =>
      h('span', { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'Email'),
    enableSorting: true,
    size: 280,
    minSize: 200,
    cell: (info) =>
      h(EditableCell, {
        value: info.getValue(),
        field: 'email',
        lead: info.row.original
      })
  },

  {
    accessorKey: 'stage_id',
    header: () =>
      h('span', { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'Stage'),
    enableSorting: true,
    filterFn: (row, _columnId, selected) => {
      if (!Array.isArray(selected) || selected.length === 0) return true
      const value = String(row.original?.stage || '').trim()
      return selected.includes(value)
    },
    size: 180,
    minSize: 150,
    cell: (info) =>
      h(StageCell, {
        lead: info.row.original
      })
  },

  {
    accessorKey: 'user_id',
    header: () =>
      h('span', { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'Owner'),
    enableSorting: true,
    filterFn: (row, _columnId, selected) => {
      if (!Array.isArray(selected) || selected.length === 0) return true
      const value = String(row.original?.owner_name || row.original?.owner_email || '').trim()
      return selected.includes(value)
    },
    size: 200,
    minSize: 160,
    cell: (info) => info.row.original.owner_name || info.row.original.owner_email || '—'
  },

  {
    accessorKey: 'source_name',
    header: () =>
      h(
        'span',
        { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' },
        'Source'
    ),
    enableSorting: true,
    filterFn: (row, columnId, selected) => {
      if (!Array.isArray(selected) || selected.length === 0) return true
      const value = String(row.getValue(columnId) || '').trim()
      return selected.includes(value)
    },
    size: 180,
    minSize: 150,
    cell: (info) => info.getValue() || '—'
  },

  {
    accessorKey: 'sequence_name',
    header: () =>
      h(
        'span',
        { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' },
        'Sequence'
    ),
    enableSorting: true,
    filterFn: (row, columnId, selected) => {
      if (!Array.isArray(selected) || selected.length === 0) return true
      const value = String(row.getValue(columnId) || '').trim()
      return selected.includes(value)
    },
    size: 180,
    minSize: 150,
    cell: (info) => info.getValue() || '—'
  },

  {
    accessorKey: 'created_at',
    header: () =>
      h(
        'span',
        { class: 'text-xs font-semibold text-gray-500 uppercase tracking-wider' },
        'Created'
    ),
    enableSorting: true,
    filterFn: (row, columnId, selected) => {
      if (!Array.isArray(selected) || selected.length === 0) return true
      const dayKey = toDateKey(row.getValue(columnId))
      return selected.includes(dayKey)
    },
    size: 170,
    minSize: 140,
    cell: (info) => {
      const value = info.getValue()
      if (!value) return '-'

      return new Date(value).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  }
]
