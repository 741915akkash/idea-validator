<script setup>
  import { Info } from 'lucide-vue-next'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'
  import TopAlert from '~/components/ui/TopAlert.vue'
  import LeadsTable from '~/components/crm/leads-table/LeadsTable.vue'
  import KanbanBoard from '~/components/crm/kanban/KanbanBoard.vue'
  import { useLeadsStore } from '~/stores/leads'
  import { useStagesStore } from '~/stores/stages'
  import { useSourcesStore } from '~/stores/sources'
  import { useUsersStore } from '~/stores/users'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'
  import { useHelpContent } from '~/composables/useHelpContent'
  import { onMounted, ref, watch } from 'vue'

  const leadsStore = useLeadsStore()
  const stagesStore = useStagesStore()
  const sourcesStore = useSourcesStore()
  const usersStore = useUsersStore()
  const quizStore = useQuizSessionStore()
  const viewMode = ref('table')
  const showHelpDrawer = ref(false)
  const showPipelinesLimitAlert = ref(false)
  const isCreatingStage = ref(false)
  const stageCreateError = ref('')
  const help = useHelpContent('leads-page-content')

  try {
    quizStore.hydrate()

    let quizId = quizStore.quizId

    if (!quizId) {
      await quizStore.loadQuizzes()

      if (quizStore.quizzes.length) {
        quizId = quizStore.quizzes[0].id
        quizStore.setQuizId(quizId)
      }
    }

    const [stages, sources, users] = await Promise.all([
      crmGlobalFetch('/api/crm/pipeline/stages'),
      crmGlobalFetch('/api/crm/sources'),
      crmGlobalFetch('/api/crm/users')
    ])

    stagesStore.setStages(stages)
    sourcesStore.setSources(sources)
    usersStore.setUsers(users)

    if (quizId) {
      const leads = await crmQuizFetch('/api/crm/leads', { quizId })
      leadsStore.setLeads(leads)
    } else {
      leadsStore.setLeads([])
    }
  } catch (error) {
    if (String(error?.statusMessage || '').includes('quiz_id required')) {
      leadsStore.setLeads([])
    } else {
      console.error(error)
    }
  }

  onMounted(() => {
    const savedViewMode = localStorage.getItem('crm-view-mode')
    if (savedViewMode === 'table' || savedViewMode === 'kanban') {
      viewMode.value = savedViewMode
    }
  })

  watch(viewMode, (value) => {
    localStorage.setItem('crm-view-mode', value)
  })

  function openHelpDrawer() {
    showHelpDrawer.value = true
  }

  async function addStage() {
    const stageName = window.prompt('Stage name')
    if (!stageName) return

    const trimmedName = stageName.trim()
    if (!trimmedName) return

    stageCreateError.value = ''
    showPipelinesLimitAlert.value = false
    isCreatingStage.value = true

    try {
      await crmGlobalFetch('/api/crm/pipeline/create', {
        method: 'POST',
        body: {
          name: trimmedName,
          position: stagesStore.stages.length + 1
        }
      })

      const updatedStages = await crmGlobalFetch('/api/crm/pipeline/stages')
      stagesStore.setStages(updatedStages)
    } catch (error) {
      const statusCode = Number(error?.statusCode || error?.data?.statusCode || 0)
      const statusMessage = String(error?.statusMessage || error?.data?.statusMessage || '')
      if (statusCode === 403 && statusMessage.includes('Pipelines limit reached')) {
        showPipelinesLimitAlert.value = true
        return
      }
      stageCreateError.value = 'Could not create stage. Please try again.'
    } finally {
      isCreatingStage.value = false
    }
  }
</script>

<template>
  <div
    class="flex min-h-[calc(100vh-7rem)] w-full min-w-0 flex-col gap-4  px-6 py-6 overflow-hidden"
    :class="viewMode === 'table' ? 'mx-auto max-w-7xl' : 'max-w-none'"
  >
    <TopAlert
      :open="showPipelinesLimitAlert"
      title="Pipelines limit reached"
      variant="warning"
      message="Upgrade your plan to create more pipelines."
      @close="showPipelinesLimitAlert = false"
    />
    <div class="mb-6 rounded-lg border border-slate-200 bg-white px-6 py-5">
      <div class="grid grid-cols-3 items-center gap-4">
        <!-- LEFT -->
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <span>Leads</span>

            <button
              type="button"
              class="inline-flex items-center text-gray-400 transition hover:text-gray-700"
              @click="
                () => {
                  openHelpDrawer()
                }
              "
              aria-label="Open Leads help"
            >
              <Info class="h-5 w-5" />
            </button>
          </h1>

          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
        </div>

        <!-- CENTER -->
        <div class="flex justify-center">
          <div
            class="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
          >
            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
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

            <div class="mx-1 h-5 w-px bg-gray-200"></div>

            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              @click="$router.push('/crm/sequences')"
            >
              Sequences
            </button>
          </div>
        </div>

        <!-- RIGHT SPACER -->
        <div></div>
      </div>
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

    <ClientOnly>
      <LeadsTable v-if="viewMode === 'table'" class="min-h-0 flex-1" />
      <KanbanBoard v-else class="min-h-0 flex-1" />
    </ClientOnly>
    <teleport to="body">
      <HelpDrawer :open="showHelpDrawer" :content="help" @close="showHelpDrawer = false" />
    </teleport>
  </div>
</template>
