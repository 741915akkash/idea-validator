<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useStagesStore } from '~/stores/stages'
  import { useLeadsStore } from '~/stores/leads'
  import { crmFetch } from '~/composables/useCrmRequest'

  const props = defineProps({
    lead: Object
  })

  const stagesStore = useStagesStore()
  const leadsStore = useLeadsStore()

  const open = ref(false)
  const triggerRef = ref(null)

  const dropdownStyle = ref({
    top: '0px',
    left: '0px',
    width: '120px'
  })

  const currentStage = computed(() => stagesStore.stages.find((s) => s.id === props.lead.stage_id))

  function updatePosition() {
    if (!triggerRef.value) return

    const rect = triggerRef.value.getBoundingClientRect()

    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    }
  }

  function toggleDropdown() {
    open.value = !open.value

    if (open.value) {
      updatePosition()
    }
  }

  function handleClickOutside(e) {
    if (triggerRef.value && !triggerRef.value.contains(e.target)) {
      open.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', updatePosition, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', updatePosition, true)
  })

  async function updateStage(stage_id) {
    open.value = false

    const nextStageId = Number(stage_id)
    const previousLead = { ...props.lead }
    const nextStage = stagesStore.stages.find((s) => s.id === nextStageId)

    // optimistic update
    leadsStore.updateLead({
      ...props.lead,
      stage_id: nextStageId,
      stage: nextStage?.name ?? props.lead.stage
    })

    try {
      const updated = await crmFetch('/api/crm/leads/update', {
        method: 'PATCH',
        body: {
          id: props.lead.id,
          field: 'stage_id',
          value: nextStageId
        }
      })

      leadsStore.updateLead(updated)
    } catch {
      leadsStore.updateLead(previousLead)
    }
  }

  /* colors */
  const colorMap = {
    1: 'bg-slate-100 text-slate-700 border-slate-200/60',
    2: 'bg-amber-50 text-amber-800 border-amber-200/50',
    3: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
    4: 'bg-indigo-50 text-indigo-800 border-indigo-200/50',
    5: 'bg-red-50 text-red-800 border-red-200/50'
  }

  const dotColorMap = {
    1: 'bg-slate-400',
    2: 'bg-amber-500',
    3: 'bg-emerald-500',
    4: 'bg-indigo-500',
    5: 'bg-red-500'
  }
</script>

<template>
  <div class="relative max-w-[120px]">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      @click.stop="toggleDropdown"
      class="group relative flex h-6 w-full items-center rounded-full border pl-6 pr-5 text-[10px] font-bold uppercase tracking-wider transition-all hover:shadow-sm"
      :class="colorMap[lead.stage_id] || 'border-gray-200 bg-gray-50 text-gray-700'"
    >
      <!-- dot -->
      <span
        class="absolute left-2.5 h-1.5 w-1.5 rounded-full"
        :class="dotColorMap[lead.stage_id]"
      />

      <span class="truncate">
        {{ currentStage?.name || '—' }}
      </span>

      <!-- arrow -->
      <svg
        class="absolute right-2 h-3 w-3 opacity-40 transition-transform"
        :class="open ? 'rotate-180' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 🔥 Teleported Dropdown -->
    <Teleport to="body">
      <div
        v-if="open"
        :style="dropdownStyle"
        class="fixed z-[9999] rounded-md border border-gray-200 bg-white shadow-lg"
      >
        <div class="max-h-60 overflow-auto py-1">
          <div
            v-for="stage in stagesStore.stages"
            :key="stage.id"
            @click="updateStage(stage.id)"
            class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
            :class="stage.id === lead.stage_id ? 'bg-gray-100 font-semibold' : ''"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="dotColorMap[stage.id]" />
            <span class="truncate">{{ stage.name }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
