<script setup>
  import { ref, onMounted } from 'vue'
  import { crmGlobalFetch } from '~/composables/useCrmRequest'
  import TopAlert from '~/components/ui/TopAlert.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const pipelines = ref([])
  const showPipelinesLimitAlert = ref(false)

  onMounted(async () => {
    await loadPipelines()
  })

  function createEmptyPipeline() {
    if (pipelines.value.some((p) => p.isNew)) {
      return
    }

    pipelines.value.forEach((p) => {
      p.open = false
    })

    pipelines.value.unshift({
      id: 'new',

      name: '',
      stages: [],

      open: true,
      isNew: true,

      isAddingStage: false,
      newStageName: '',

      editingStageIndex: null,
      editingStageValue: '',

      deletingStageIndex: null,

      confirmingDeletePipeline: false
    })
  }

  function startAddStage(pipelineId) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    pipeline.isAddingStage = true
  }

  async function loadPipelines() {
    const pipelineRows = await crmGlobalFetch('/api/crm/pipelines/list')
    console.log('Fetched pipelines:', pipelineRows)

    const pipelinesWithStages = await Promise.all(
      pipelineRows.map(async (pipeline) => {
        const stages = await crmGlobalFetch('/api/crm/pipelines/stages/list', {
          query: {
            pipelineId: pipeline.id
          }
        })

        return {
          ...pipeline,
          stages,

          open: false,

          isNew: false,

          isAddingStage: false,
          newStageName: '',

          editingStageIndex: null,
          editingStageValue: '',

          deletingStageIndex: null,

          confirmingDeletePipeline: false
        }
      })
    )

    pipelines.value = pipelinesWithStages
    console.log('Loaded pipelines:', pipelines.value)
  }

  async function createPipeline(pipeline) {
    const name = pipeline.name.trim()

    if (!name) return

    try {
      const createdPipeline = await crmGlobalFetch('/api/crm/pipelines/create', {
        method: 'POST',
        body: {
          name
        }
      })

      for (const [index, stage] of pipeline.stages.entries()) {
        await crmGlobalFetch('/api/crm/pipelines/stages/create', {
          method: 'POST',
          body: {
            pipeline_id: createdPipeline.id,
            name: stage.name,
            position: index + 1
          }
        })
      }

      await loadPipelines()
    } catch (error) {
      if (error?.response?.status === 403) {
        showPipelinesLimitAlert.value = true
        cancelNewPipeline()
        return
      }

      throw error
    }
  }

  function cancelNewPipeline() {
    pipelines.value = pipelines.value.filter((p) => p.id !== 'new')
  }

  function togglePipeline(id) {
    pipelines.value.forEach((pipeline) => {
      if (pipeline.id === id) {
        if (!pipeline.isNew) {
          pipeline.open = !pipeline.open
        }
      } else {
        pipeline.open = false
      }
    })
  }

  async function addStage(pipelineId) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    const name = pipeline.newStageName.trim()

    if (!name) return

    // NEW PIPELINE = LOCAL ONLY
    if (pipeline.isNew) {
      pipeline.stages.push({
        id: `temp-${Date.now()}`,
        name
      })

      pipeline.newStageName = ''
      pipeline.isAddingStage = false

      return
    }

    await crmGlobalFetch('/api/crm/pipelines/stages/create', {
      method: 'POST',
      body: {
        pipeline_id: pipeline.id,
        name,
        position: pipeline.stages.length + 1
      }
    })

    await loadPipelines()
  }

  function cancelAddStage(pipelineId) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    pipeline.isAddingStage = false
    pipeline.newStageName = ''
  }

  async function deleteStage(pipelineId, stageIndex) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    // NEW PIPELINE = LOCAL ONLY
    if (pipeline.isNew) {
      pipeline.stages.splice(stageIndex, 1)
      return
    }

    const stage = pipeline.stages[stageIndex]

    await crmGlobalFetch('/api/crm/pipelines/stages/delete', {
      method: 'POST',
      body: {
        id: stage.id
      }
    })

    await loadPipelines()
  }

  function cancelDeleteStage(pipelineId) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    pipeline.deletingStageIndex = null
  }

  function startRenameStage(pipelineId, stageIndex) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    pipeline.editingStageIndex = stageIndex
    pipeline.editingStageValue = pipeline.stages[stageIndex].name
  }

  function cancelRenameStage(pipelineId) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    pipeline.editingStageIndex = null
    pipeline.editingStageValue = ''
  }

  async function saveRenameStage(pipelineId) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    const index = pipeline.editingStageIndex

    const stage = pipeline.stages[index]

    const name = pipeline.editingStageValue.trim()

    if (!name) return

    // NEW PIPELINE = LOCAL ONLY
    if (pipeline.isNew) {
      pipeline.stages[index].name = name

      pipeline.editingStageIndex = null
      pipeline.editingStageValue = ''

      return
    }

    await crmGlobalFetch('/api/crm/pipelines/stages/update', {
      method: 'PATCH',
      body: {
        id: stage.id,
        name
      }
    })

    await loadPipelines()
  }

  async function savePipeline(pipeline) {
    if (pipeline.isNew) {
      return createPipeline(pipeline)
    }

    await crmGlobalFetch('/api/crm/pipelines/update', {
      method: 'PATCH',
      body: {
        id: pipeline.id,
        name: pipeline.name
      }
    })

    await loadPipelines()
  }

  function startDeletePipeline(id) {
    const pipeline = pipelines.value.find((p) => p.id === id)

    if (!pipeline) return

    pipeline.confirmingDeletePipeline = true
  }

  function cancelDeletePipeline(id) {
    const pipeline = pipelines.value.find((p) => p.id === id)

    if (!pipeline) return

    pipeline.confirmingDeletePipeline = false
  }

  async function deletePipeline(id) {
    await crmGlobalFetch('/api/crm/pipelines/delete', {
      method: 'POST',
      body: {
        id
      }
    })

    await loadPipelines()
  }
</script>

<template>
  <div class="mx-auto w-full max-w-4xl space-y-6 px-6 py-6">
    <TopAlert
      :open="showPipelinesLimitAlert"
      title="Pipelines limit reached"
      variant="warning"
      message="Upgrade your plan to create more pipelines."
      @close="showPipelinesLimitAlert = false"
    />
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-app-text">Pipeline Management</h2>

        <p class="mt-1 text-sm text-app-muted">Manage pipelines and their stages.</p>
      </div>
    </div>

    <!-- Cards -->
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))">
      <div
        v-if="!pipelines.some((p) => p.isNew)"
        class="rounded-xl border border-app-border bg-app-panel text-app-text shadow-sm"
      >
        <button
          class="flex min-h-[260px] w-full flex-col items-center justify-center gap-3 p-5 transition hover:bg-app-card"
          @click="createEmptyPipeline"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-app-border bg-app-card text-app-text"
          >
            +
          </div>

          <span class="font-medium text-app-muted"> New Pipeline </span>
        </button>
      </div>

      <div
        v-for="pipeline in pipelines"
        :key="pipeline.id"
        class="rounded-xl border border-app-border bg-app-panel text-app-text shadow-sm"
      >
        <div class="p-5">
          <h3 class="text-lg font-semibold text-app-text">
            {{ pipeline.name }}
          </h3>

          <div class="mt-4 flex gap-4 text-sm text-app-muted">
            <span>{{ pipeline.stages.length }} Stages</span>
          </div>

          <!-- COLLAPSED VIEW -->
          <template v-if="!pipeline.open">
            <div class="mt-5 space-y-2">
              <div
                v-for="stage in pipeline.stages"
                :key="stage.id"
                class="rounded-md border border-app-border bg-app-card px-3 py-2 text-sm text-app-text"
              >
                {{ stage.name }}
              </div>
            </div>

            <button
              class="mt-5 w-full rounded-lg border border-app-border px-3 py-2 text-sm font-medium text-app-text transition hover:bg-app-card"
              @click="pipeline.isNew ? cancelNewPipeline() : togglePipeline(pipeline.id)"
            >
              Manage Pipeline
            </button>
          </template>

          <!-- EXPANDED VIEW -->
          <template v-else>
            <div class="mt-5">
              <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-app-muted">
                Pipeline Name
              </label>

              <input
                v-model="pipeline.name"
                type="text"
                class="w-full rounded-lg border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div class="mt-5">
              <h4 class="mb-3 text-sm font-semibold text-app-text">Stages</h4>

              <div class="space-y-2">
                <div
                  v-for="(stage, index) in pipeline.stages"
                  :key="stage.id"
                  class="rounded-lg border border-app-border bg-app-card px-3 py-2 text-app-text"
                >
                  <template v-if="pipeline.editingStageIndex === index">
                    <input
                      v-model="pipeline.editingStageValue"
                      class="w-full rounded border border-app-border bg-app-panel px-2 py-1 text-sm text-app-text outline-none focus:border-emerald-500"
                    />

                    <div class="mt-2 flex gap-2">
                      <button
                        class="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                        @click="saveRenameStage(pipeline.id)"
                      >
                        Save
                      </button>

                      <button
                        class="rounded border border-app-border bg-app-panel px-2 py-1 text-xs text-app-text hover:bg-app-card"
                        @click="cancelRenameStage(pipeline.id)"
                      >
                        Cancel
                      </button>
                    </div>
                  </template>

                  <template v-else>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-app-text"> {{ index + 1 }}. {{ stage.name }} </span>

                      <div class="flex gap-3">
                        <button
                          class="text-xs text-app-muted hover:text-app-text"
                          @click="startRenameStage(pipeline.id, index)"
                        >
                          Edit
                        </button>

                        <button
                          v-if="!pipeline.isNew"
                          class="text-xs text-red-500 hover:text-red-500"
                          @click="deleteStage(pipeline.id, index)"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="mt-4">
                <template v-if="pipeline.isAddingStage">
                  <input
                    v-model="pipeline.newStageName"
                    placeholder="Stage name"
                    class="w-full rounded-lg border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text outline-none focus:border-emerald-500"
                  />

                  <div class="mt-2 flex gap-2">
                    <button
                      class="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
                      @click="addStage(pipeline.id)"
                    >
                      Create
                    </button>

                    <button
                      class="rounded-lg border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text hover:bg-app-card"
                      @click="cancelAddStage(pipeline.id)"
                    >
                      Cancel
                    </button>
                  </div>
                </template>

                <button
                  v-else
                  class="w-full rounded-lg border border-dashed border-app-border bg-app-panel px-3 py-2 text-sm text-app-muted transition hover:bg-app-card"
                  @click="startAddStage(pipeline.id)"
                >
                  + Add Stage
                </button>
              </div>
            </div>

            <div class="mt-5 flex gap-2">
              <button
                class="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                @click="savePipeline(pipeline)"
              >
                Save
              </button>

              <button
                class="rounded-lg border border-app-border bg-app-panel px-3 py-2 text-sm font-medium text-app-text transition hover:bg-app-card"
                @click="pipeline.isNew ? cancelNewPipeline() : togglePipeline(pipeline.id)"
              >
                Close
              </button>

              <button
                class="hover:bg-red-500/100/5/10 rounded-lg border border-red-500/20 px-3 py-2 text-sm font-medium text-red-500 transition"
                @click="deletePipeline(pipeline.id)"
              >
                Delete
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
