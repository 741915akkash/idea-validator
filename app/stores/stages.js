import { defineStore } from 'pinia'

export const useStagesStore = defineStore('stages', {
  state: () => ({
    stages: []
  }),

  actions: {
    setStages(data) {
      this.stages = data
    },

    clearStages() {
      this.stages = []
    },

    updateStage(updatedStage) {
      if (!updatedStage) return

      const index = this.stages.findIndex((stage) => stage.id === updatedStage.id)

      if (index === -1) return

      this.stages = [
        ...this.stages.slice(0, index),
        { ...this.stages[index], ...updatedStage },
        ...this.stages.slice(index + 1)
      ]
    }
  }
})
