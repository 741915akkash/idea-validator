import { defineStore } from 'pinia'

export const usePipelinesStore = defineStore('pipelines', {
  state: () => ({
    pipelines: [],
    activePipelineId: null
  }),

  actions: {
    setPipelines(pipelines) {
      this.pipelines = pipelines

      if (!this.activePipelineId && pipelines.length) {
        this.activePipelineId = pipelines[0].id
      }
    },

    setActivePipeline(id) {
      this.activePipelineId = id
    }
  }
})
