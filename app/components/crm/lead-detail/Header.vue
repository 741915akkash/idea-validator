<script setup>
  import { ChevronDown, X } from 'lucide-vue-next'
  import { useStagesStore } from '~/stores/stages'
  import { useLeadsStore } from '~/stores/leads'
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const open = ref(false)
  const triggerRef = ref(null)
  const dropdownStyle = ref({})

  const props = defineProps({
    lead: { type: Object, required: true },
    editingField: String,
    editValue: [String, Number]
  })

  const emit = defineEmits(['close', 'start-edit', 'save-edit', 'update-value'])

  const stagesStore = useStagesStore()
  const leadsStore = useLeadsStore()

  const stageColorMap = {
    1: 'bg-slate-100 text-slate-700',
    2: 'bg-amber-100 text-amber-700',
    3: 'bg-emerald-100 text-emerald-700',
    4: 'bg-indigo-100 text-indigo-700',
    5: 'bg-red-100 text-red-700'
  }

  const dotColorMap = {
    1: 'bg-slate-400',
    2: 'bg-amber-500',
    3: 'bg-emerald-500',
    4: 'bg-indigo-500',
    5: 'bg-red-500'
  }

  function updatePosition() {
    if (!triggerRef.value) return

    const rect = triggerRef.value.getBoundingClientRect()

    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`
    }
  }

  function toggleDropdown() {
    open.value = !open.value
    if (open.value) updatePosition()
  }

  function updateStage(stageId) {
    leadsStore.updateLead({ id: props.lead.id, stage_id: stageId })
    open.value = false
  }

  function handleClickOutside(e) {
    if (triggerRef.value && !triggerRef.value.contains(e.target)) {
      open.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', updatePosition, true)
    window.removeEventListener('resize', updatePosition)
  })
</script>

<template>
  <header class="z-10 flex h-[72px] shrink-0 items-center border-b border-gray-100 bg-white px-6">
    <div class="min-w-0 flex-1">
      <div class="mb-0.5 flex items-center gap-2 text-gray-700">
        <!-- Name -->
        <input
          v-if="editingField === 'name'"
          id="edit-name"
          :value="editValue"
          @input="$emit('update-value', $event.target.value)"
          @blur="$emit('save-edit')"
          @keyup.enter="$emit('save-edit')"
          class="w-full border-b border-emerald-500 bg-transparent text-base font-semibold text-gray-900 outline-none"
        />

        <h2
          v-else
          @click="$emit('start-edit', 'name', lead.name)"
          class="-ml-1 cursor-pointer truncate rounded px-1 text-base font-semibold text-gray-900 hover:bg-gray-50"
        >
          {{ lead.name }}
        </h2>

        <!-- Stage button -->
        <button ref="triggerRef" @click.stop="toggleDropdown">
          <span
            :class="[
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              stageColorMap[lead.stage_id]
            ]"
          >
            {{ stagesStore.stages.find((s) => s.id === lead.stage_id)?.name }}
            <ChevronDown class="h-3 w-3" />
          </span>
        </button>
      </div>

      <!-- Sub info -->
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <span class="truncate">{{ lead.company }}</span>
        <span class="h-1 w-1 rounded-full bg-gray-200"></span>
        <span class="truncate">{{ lead.email }}</span>
      </div>
    </div>

    <!-- Close -->
    <button
      @click="$emit('close')"
      class="-mr-2 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    >
      <X class="h-5 w-5" />
    </button>
  </header>

  <!-- ✅ TELEPORT OUTSIDE HEADER -->
  <Teleport to="body">
    <div
      v-if="open"
      :style="dropdownStyle"
      class="w-40 fixed z-[9999] rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
    >
      <button
        v-for="s in stagesStore.stages"
        :key="s.id"
        @click="updateStage(s.id)"
        class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] font-medium text-gray-700 hover:bg-gray-100"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="dotColorMap[s.id]" />
        {{ s.name }}
      </button>
    </div>
  </Teleport>
</template>
