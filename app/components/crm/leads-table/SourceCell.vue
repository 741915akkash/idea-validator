<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useSourcesStore } from '~/stores/sources'
  import { useLeadsStore } from '~/stores/leads'

  const props = defineProps({
    lead: Object
  })

  const sourcesStore = useSourcesStore()
  const leadsStore = useLeadsStore()

  const open = ref(false)
  const triggerRef = ref(null)

  const dropdownStyle = ref({
    top: '0px',
    left: '0px',
    width: '120px'
  })

  const currentSource = computed(() =>
    sourcesStore.sources.find((s) => s.id === props.lead.source_id)
  )

  async function fetchSources() {
    if (sourcesStore.sources.length > 0) return

    try {
      const sources = await $fetch('/api/crm/sources')
      sourcesStore.setSources(sources)
    } catch {
      sourcesStore.setSources([])
    }
  }

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
    fetchSources()

    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', updatePosition, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', updatePosition, true)
  })

  async function updateSource(source_id) {
    open.value = false

    const previousLead = { ...props.lead }
    const selected = sourcesStore.sources.find((s) => s.id === source_id)

    // optimistic update
    leadsStore.updateLead({
      ...props.lead,
      source_id,
      source: selected?.name ?? props.lead.source
    })

    try {
      const updated = await $fetch('/api/crm/leads/update', {
        method: 'PATCH',
        body: {
          id: props.lead.id,
          field: 'source_id',
          value: source_id
        }
      })

      leadsStore.updateLead(updated)
    } catch {
      leadsStore.updateLead(previousLead)
    }
  }
</script>

<template>
  <div class="relative max-w-[140px]">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      @click.stop="toggleDropdown"
      class="group relative flex h-6 w-full items-center rounded-full border border-gray-200 bg-gray-50 pl-3 pr-5 text-[10px] font-medium text-gray-700 transition-all hover:shadow-sm"
    >
      <span class="truncate">
        {{ currentSource?.name || '—' }}
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

    <!-- Dropdown -->
    <Teleport to="body">
      <div
        v-if="open"
        :style="dropdownStyle"
        class="fixed z-[9999] rounded-md border border-gray-200 bg-white shadow-lg"
      >
        <div class="max-h-60 overflow-auto py-1">
          <div
            v-for="source in sourcesStore.sources"
            :key="source.id"
            @click="updateSource(source.id)"
            class="flex cursor-pointer items-center px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
            :class="source.id === lead.source_id ? 'bg-gray-100 font-semibold' : ''"
          >
            <span class="truncate">{{ source.name }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
