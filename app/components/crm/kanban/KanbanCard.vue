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
  const emit = defineEmits(['open'])

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
    @click="emit('open', lead)"
    class="group/card cursor-grab rounded-xl border border-app-border p-3.5 text-app-text shadow-sm transition-all hover:border-emerald-300 hover:shadow-md active:cursor-grabbing"
  >
    <div class="mb-2 flex items-start justify-between">
      <h4
        class="text-xs font-bold text-app-text transition-colors group-hover/card:text-emerald-600"
      >
        {{ lead.name }}
      </h4>
      <div
        v-if="owner"
        class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-app-border bg-app-panel text-[8px] font-bold text-app-muted"
        :title="owner.name"
      >
        {{ initials }}
      </div>
    </div>

    <div class="space-y-1.5">
      <div class="flex items-center gap-1.5 text-app-muted">
        <Building2 class="h-3 w-3 flex-shrink-0" />
        <span class="truncate text-[10px] font-medium">{{ lead.company }}</span>
      </div>
      <div class="flex items-center gap-1.5 text-app-muted">
        <Mail class="h-3 w-3 flex-shrink-0" />
        <span class="truncate text-[10px] font-medium">{{ lead.email }}</span>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-app-border pt-3">
      <div
        class="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-app-muted"
      >
        <Calendar class="h-2.5 w-2.5" />
        {{ formattedDate }}
      </div>
      <div class="flex items-center -space-x-1">
        <div v-if="lead.value" class="text-[10px] font-bold text-app-text">
          ${{ lead.value.toLocaleString() }}
        </div>
      </div>
    </div>
  </div>
</template>
