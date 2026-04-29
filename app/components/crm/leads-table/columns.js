import { h } from 'vue'
import EditableCell from './EditableCell.vue'
import StageCell from './StageCell.vue'

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
