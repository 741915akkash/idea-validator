<script setup>
  import { ref, onMounted } from 'vue'
  import { crmGlobalFetch } from '~/composables/useCrmRequest'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const pipelines = ref([])
  const showCreatePipeline = ref(false)
  const newPipelineName = ref('')

  onMounted(async () => {
    await loadPipelines()
  })

  // function createPipeline(id, name, leads, stages) {
  //   return {
  //     id,
  //     name,
  //     leads,
  //     stages,

  //     open: false,

  //     isAddingStage: false,
  //     newStageName: '',

  //     editingStageIndex: null,
  //     editingStageValue: '',

  //     deletingStageIndex: null,

  //     confirmingDeletePipeline: false
  //   }
  // }

  async function loadPipelines() {
    const pipelineRows = await crmGlobalFetch('/api/crm/pipelines')

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
  }

  async function createPipeline() {
    const name = newPipelineName.value.trim()

    if (!name) return

    await crmGlobalFetch('/api/crm/pipelines/create', {
      method: 'POST',
      body: {
        name
      }
    })

    showCreatePipeline.value = false
    newPipelineName.value = ''

    await loadPipelines()
  }

  function togglePipeline(id) {
    pipelines.value.forEach((pipeline) => {
      pipeline.open = pipeline.id === id ? !pipeline.open : false
    })
  }

  async function addStage(pipelineId) {
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)

    if (!pipeline) return

    const name = pipeline.newStageName.trim()

    if (!name) return

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
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-app-text">Pipeline Management</h2>

        <p class="mt-1 text-sm text-app-muted">Manage pipelines and their stages.</p>
      </div>

      <div v-if="showCreatePipeline" class="rounded-xl border border-app-border p-4 text-app-text">
        <input
          v-model="newPipelineName"
          placeholder="Pipeline name"
          class="w-full rounded-lg border border-app-border px-3 py-2"
        />

        <div class="mt-3 flex gap-2">
          <button class="rounded-lg bg-emerald-600 px-4 py-2 text-white" @click="createPipeline">
            Create Pipeline
          </button>

          <button class="rounded-lg border px-4 py-2" @click="showCreatePipeline = false">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))">
      <div
        v-for="pipeline in pipelines"
        :key="pipeline.id"
        class="rounded-xl border border-app-border text-app-text shadow-sm"
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
                class="rounded-md bg-app-card px-3 py-2 text-sm text-app-text"
              >
                {{ stage.name }}
              </div>
            </div>

            <button
              class="mt-5 w-full rounded-lg border border-app-border px-3 py-2 text-sm font-medium text-app-text transition hover:bg-app-card"
              @click="togglePipeline(pipeline.id)"
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
                class="w-full rounded-lg border border-app-border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div class="mt-5">
              <h4 class="mb-3 text-sm font-semibold text-app-text">Stages</h4>

              <div class="space-y-2">
                <div
                  v-for="(stage, index) in pipeline.stages"
                  :key="stage.id"
                  class="rounded-lg border border-app-border bg-app-card px-3 py-2"
                >
                  <template v-if="pipeline.editingStageIndex === index">
                    <input
                      v-model="pipeline.editingStageValue"
                      class="w-full rounded border border-app-border px-2 py-1 text-sm"
                    />

                    <div class="mt-2 flex gap-2">
                      <button
                        class="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                        @click="saveRenameStage(pipeline.id)"
                      >
                        Save
                      </button>

                      <button
                        class="rounded border px-2 py-1 text-xs"
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
                          class="text-xs text-red-500 hover:text-red-700"
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
                    class="w-full rounded-lg border border-app-border px-3 py-2 text-sm"
                  />

                  <div class="mt-2 flex gap-2">
                    <button
                      class="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
                      @click="addStage(pipeline.id)"
                    >
                      Create
                    </button>

                    <button
                      class="rounded-lg border px-3 py-2 text-sm"
                      @click="cancelAddStage(pipeline.id)"
                    >
                      Cancel
                    </button>
                  </div>
                </template>

                <button
                  v-else
                  class="w-full rounded-lg border border-dashed border-app-border px-3 py-2 text-sm text-app-muted hover:bg-app-card"
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
                class="rounded-lg border border-app-border px-3 py-2 text-sm font-medium text-app-text hover:bg-app-card"
                @click="togglePipeline(pipeline.id)"
              >
                Close
              </button>

              <button
                class="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
