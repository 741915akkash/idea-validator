<script setup>
  import LeadsTable from '~/components/crm/leads-table/LeadsTable.vue'
  import KanbanBoard from '~/components/crm/kanban/KanbanBoard.vue'
  import { useLeadsStore } from '~/stores/leads'
  import { useStagesStore } from '~/stores/stages'
  import { useSourcesStore } from '~/stores/sources'
  import { useUsersStore } from '~/stores/users'
  import { onMounted, ref, watch } from 'vue'

  const leadsStore = useLeadsStore()
  const stagesStore = useStagesStore()
  const sourcesStore = useSourcesStore()
  const usersStore = useUsersStore()

  const { data: leads } = await useFetch('/api/crm/leads')
  const { data: stages } = await useFetch('/api/crm/pipeline/stages')
  const { data: sources } = await useFetch('/api/crm/sources')
  const { data: users } = await useFetch('/api/crm/users')

  leadsStore.setLeads(leads.value)
  stagesStore.setStages(stages.value)
  sourcesStore.setSources(sources.value)
  usersStore.setUsers(users.value)

  const viewMode = ref('table')
  const isCreatingStage = ref(false)
  const stageCreateError = ref('')

  onMounted(() => {
    const savedViewMode = localStorage.getItem('crm-view-mode')
    if (savedViewMode === 'table' || savedViewMode === 'kanban') {
      viewMode.value = savedViewMode
    }
  })

  watch(viewMode, (value) => {
    localStorage.setItem('crm-view-mode', value)
  })

  async function addStage() {
    const stageName = window.prompt('Stage name')
    if (!stageName) return

    const trimmedName = stageName.trim()
    if (!trimmedName) return

    stageCreateError.value = ''
    isCreatingStage.value = true

    try {
      await $fetch('/api/crm/pipeline/create', {
        method: 'POST',
        body: {
          name: trimmedName,
          position: stagesStore.stages.length + 1
        }
      })

      const updatedStages = await $fetch('/api/crm/pipeline/stages')
      stagesStore.setStages(updatedStages)
    } catch {
      stageCreateError.value = 'Could not create stage. Please try again.'
    } finally {
      isCreatingStage.value = false
    }
  }
</script>

<template>
  <div class="mx-auto flex min-h-[calc(100vh-7rem)] w-full min-w-0 max-w-7xl flex-col gap-4">
    <div class="grid grid-cols-3 items-center">
      <!-- LEFT -->
      <h1 class="text-2xl font-semibold">Leads</h1>

      <!-- CENTER -->
      <div class="flex justify-center">
        <div
          class="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
        >
          <!-- VIEW TOGGLES -->
          <button
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            "
            @click="viewMode = 'table'"
          >
            Table
          </button>

          <button
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              viewMode === 'kanban'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            "
            @click="viewMode = 'kanban'"
          >
            Kanban
          </button>

          <!-- DIVIDER -->
          <div class="mx-1 h-5 w-px bg-gray-200"></div>

          <!-- SEQUENCES (navigation) -->
          <button
            class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
            @click="$router.push('/crm/sequences')"
          >
            Sequences
          </button>
        </div>
      </div>

      <!-- RIGHT (empty for now / future CTA) -->
      <div></div>
    </div>

    <!-- KANBAN ACTION -->
    <button
      v-if="viewMode === 'kanban'"
      class="self-start rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="isCreatingStage"
      @click="addStage"
    >
      {{ isCreatingStage ? 'Adding...' : '+ Add Stage' }}
    </button>

    <p v-if="stageCreateError" class="text-xs text-red-600">
      {{ stageCreateError }}
    </p>

    <LeadsTable v-if="viewMode === 'table'" class="min-h-0 flex-1" />
    <KanbanBoard v-else class="min-h-0 flex-1" />
  </div>
</template>
