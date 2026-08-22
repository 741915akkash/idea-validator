<script setup>
  import { Info } from 'lucide-vue-next'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'
  import TopAlert from '~/components/ui/TopAlert.vue'
  import LeadsTable from '~/components/crm/leads-table/LeadsTable.vue'
  import KanbanBoard from '~/components/crm/kanban/KanbanBoard.vue'
  import { useLeadsStore } from '~/stores/leads'
  import { useSourcesStore } from '~/stores/sources'
  import { usePipelinesStore } from '~/stores/pipelines'
  import { useUsersStore } from '~/stores/users'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'
  import { useHelpContent } from '~/composables/useHelpContent'
  import { onMounted, ref, watch } from 'vue'

  const leadsStore = useLeadsStore()
  const sourcesStore = useSourcesStore()
  const usersStore = useUsersStore()
  const pipelinesStore = usePipelinesStore()
  const quizStore = useQuizSessionStore()

  const viewMode = ref('table')
  const showHelpDrawer = ref(false)

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

    const [pipelines, sources, users] = await Promise.all([
      crmGlobalFetch('/api/crm/pipelines/list'),
      crmGlobalFetch('/api/crm/sources'),
      crmGlobalFetch('/api/crm/users')
    ])

    pipelinesStore.setPipelines(pipelines)

    sourcesStore.setSources(sources)
    usersStore.setUsers(users)

    if (quizId) {
      const leads = await crmQuizFetch('/api/crm/leads', {
        quizId
      })

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
</script>

<template>
  <div
    class="flex min-h-[calc(100vh-7rem)] w-full min-w-0 flex-col gap-4 overflow-hidden px-6 py-6"
    :class="viewMode === 'table' ? 'mx-auto max-w-7xl' : 'max-w-none'"
  >
    <div class="mb-6 rounded-lg border border-app-border px-6 py-5 text-app-text">
      <div class="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:items-center">
        <!-- LEFT -->
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-app-text">
            <span>Leads</span>

            <button
              type="button"
              class="inline-flex items-center text-app-muted transition hover:text-app-muted"
              aria-label="Open Leads help"
              @click="
                () => {
                  openHelpDrawer()
                }
              "
            >
              <Info class="h-5 w-5" />
            </button>
          </h1>

          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
        </div>

        <!-- CENTER -->
        <div
          class="grid w-full grid-cols-2 gap-1 rounded-lg border border-app-border bg-app-panel p-1 text-app-text sm:flex sm:w-fit sm:items-center sm:gap-0"
        >
          <button
            class="rounded-md px-2 py-2 text-sm font-medium transition-colors sm:px-3 sm:py-1.5"
            :class="
              viewMode === 'table'
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'text-app-muted hover:bg-app-hover hover:text-app-text'
            "
            @click="viewMode = 'table'"
          >
            Table
          </button>

          <button
            class="rounded-md px-2 py-2 text-sm font-medium transition-colors sm:px-3 sm:py-1.5"
            :class="
              viewMode === 'kanban'
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'text-app-muted hover:bg-app-hover hover:text-app-text'
            "
            @click="viewMode = 'kanban'"
          >
            Kanban
          </button>

          <button
            class="rounded-md px-2 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-hover hover:text-app-text sm:px-3 sm:py-1.5"
            @click="$router.push('/crm/pipelines')"
          >
            Pipelines
          </button>

          <button
            class="rounded-md px-2 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-hover hover:text-app-text sm:px-3 sm:py-1.5"
            @click="$router.push('/crm/sequences')"
          >
            Sequences
          </button>
        </div>

        <!-- RIGHT SPACER -->
        <div></div>
      </div>
    </div>

    <ClientOnly>
      <LeadsTable v-if="viewMode === 'table'" class="min-h-0 flex-1" />
      <KanbanBoard v-else class="min-h-0 flex-1" />
    </ClientOnly>

    <teleport to="body">
      <HelpDrawer :open="showHelpDrawer" :content="help" @close="showHelpDrawer = false" />
    </teleport>
  </div>
</template>
