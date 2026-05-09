<script setup>
  import { ref, watch } from 'vue'
  import draggable from 'vuedraggable'
  import { useLeadsStore } from '~/stores/leads'
  import { crmFetch } from '~/composables/useCrmRequest'
  import KanbanCard from './KanbanCard.vue'
  import EditStageModal from './EditStageModal.vue'
  import { MoreHorizontal, Plus } from 'lucide-vue-next'

  const props = defineProps({
    stage: Object
  })
  const emit = defineEmits(['open-lead'])

  const leadsStore = useLeadsStore()
  const showEditModal = ref(false)

  /* ✅ local writable array (REQUIRED for draggable) */
  const localLeads = ref([])

  const isDragging = ref(false)

  function onStart() {
    isDragging.value = true
  }

  function onEnd() {
    isDragging.value = false
  }

  watch(
    () => leadsStore.leads,
    (leads) => {
      if (isDragging.value) return

      const next = leads.filter((l) => l.stage_id === props.stage.id)

      if (JSON.stringify(next) !== JSON.stringify(localLeads.value)) {
        localLeads.value = next
      }
    },
    { immediate: true }
  )

  /* ✅ REQUIRED for cross-column */
  function onMove() {
    return true
  }

  /* ✅ drag handler */
  async function onDragChange(evt) {
    // moved into this column
    if (evt.added) {
      const lead = evt.added.element
      const prev = { ...lead }

      // optimistic update
      leadsStore.updateLead({
        ...lead,
        stage_id: props.stage.id
      })

      try {
        await crmFetch('/api/crm/leads/update', {
          method: 'PATCH',
          body: {
            id: lead.id,
            field: 'stage_id',
            value: props.stage.id
          }
        })
      } catch {
        leadsStore.updateLead(prev)
      }
    }
  }
</script>

<template>
  <div class="flex w-80 flex-shrink-0 flex-col">
    <!-- HEADER -->
    <div class="mb-3 flex items-center justify-between px-1">
      <h3 class="text-xs font-bold uppercase text-gray-500">
        {{ stage.name }}
      </h3>

      <button @click="showEditModal = true">
        <MoreHorizontal class="h-4 w-4 text-gray-400" />
      </button>
    </div>

    <!-- 🔥 DRAG AREA -->
    <draggable
      v-model="localLeads"
      :group="{ name: 'leads', pull: true, put: true }"
      :move="onMove"
      item-key="id"
      class="min-h-[200px] flex-1 space-y-3 overflow-y-auto rounded-xl bg-gray-100/50 p-2"
      ghost-class="opacity-50"
      :animation="200"
      @change="onDragChange"
    >
      <template #item="{ element }">
        <KanbanCard :lead="element" @open="emit('open-lead', $event)" />
      </template>
    </draggable>

    <EditStageModal v-if="showEditModal" :stage="stage" @close="showEditModal = false" />
  </div>
</template>
