import { defineStore } from 'pinia'

export const usePipelinesStore = defineStore('pipelines', {
  state: () => ({
    pipelines: [],
    activePipelineId: null
  }),

  getters: {
    activePipeline(state) {
      return state.pipelines.find((pipeline) => pipeline.id === state.activePipelineId) || null
    },

    activeStages() {
      return this.activePipeline?.stages || []
    }
  },

  actions: {
    setPipelines(pipelines) {
      this.pipelines = pipelines

      if (!this.activePipelineId && pipelines.length) {
        this.activePipelineId = pipelines[0].id
      }
    },

    setActivePipeline(id) {
      this.activePipelineId = id
    },

    setStages(stages) {
      const pipeline = this.activePipeline

      if (!pipeline) return

      pipeline.stages = stages
    },

    clearStages() {
      const pipeline = this.activePipeline

      if (!pipeline) return

      pipeline.stages = []
    },

    updateStage(updatedStage) {
      if (!updatedStage) return

      const pipelineId = updatedStage.pipeline_id || this.activePipelineId

      const pipeline = this.pipelines.find((p) => p.id === pipelineId)

      if (!pipeline) return

      const index = pipeline.stages.findIndex((stage) => stage.id === updatedStage.id)

      if (index === -1) return

      pipeline.stages = [
        ...pipeline.stages.slice(0, index),
        {
          ...pipeline.stages[index],
          ...updatedStage
        },
        ...pipeline.stages.slice(index + 1)
      ]
    },

    addStage(stage) {
      if (!stage) return

      const pipelineId = stage.pipeline_id || this.activePipelineId

      const pipeline = this.pipelines.find((p) => p.id === pipelineId)

      if (!pipeline) return

      pipeline.stages = [...pipeline.stages, stage]
    },

    deleteStage(stageId) {
      const pipeline = this.activePipeline

      if (!pipeline) return

      pipeline.stages = pipeline.stages.filter((stage) => stage.id !== stageId)
    }
  }
})
