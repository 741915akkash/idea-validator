<script setup>
  import { computed } from 'vue'
  import { useUsersStore } from '~/stores/users'
  import { Building2, Mail, Calendar } from 'lucide-vue-next'

  const props = defineProps({
    lead: {
      type: Object,
      required: true
    }
  })

  const usersStore = useUsersStore()
  const owner = computed(() => usersStore.users.find((u) => u.id === props.lead.user_id))

  const initials = computed(() => {
    if (!owner.value) return '?'
    const source = (owner.value.name || owner.value.email || '').trim()
    if (!source) return '?'

    return source
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
  })

  const formattedDate = computed(() => {
    return new Date(props.lead.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  })
</script>

<template>
  <div
    draggable="true"
    class="group/card cursor-grab rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md active:cursor-grabbing"
  >
    <div class="mb-2 flex items-start justify-between">
      <h4
        class="text-xs font-bold text-gray-900 transition-colors group-hover/card:text-emerald-600"
      >
        {{ lead.name }}
      </h4>
      <div
        v-if="owner"
        class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[8px] font-bold text-gray-500"
        :title="owner.name"
      >
        {{ initials }}
      </div>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center gap-1.5 text-gray-400">
        <Building2 class="h-3 w-3 flex-shrink-0" />
        <span class="truncate text-[10px] font-medium">{{ lead.company }}</span>
      </div>
      <div class="flex items-center gap-1.5 text-gray-400">
        <Mail class="h-3 w-3 flex-shrink-0" />
        <span class="truncate text-[10px] font-medium">{{ lead.email }}</span>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
      <div
        class="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-400"
      >
        <Calendar class="h-2.5 w-2.5" />
        {{ formattedDate }}
      </div>
      <div class="flex items-center -space-x-1">
        <div v-if="lead.value" class="text-[10px] font-bold text-gray-900">
          ${{ lead.value.toLocaleString() }}
        </div>
      </div>
    </div>
  </div>
</template>
