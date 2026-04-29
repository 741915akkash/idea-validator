import { defineStore } from 'pinia';

export const useSourcesStore = defineStore('sources', {
  state: () => ({
    sources: [],
  }),

  actions: {
    setSources(data) {
      this.sources = Array.isArray(data) ? data : [];
    },

    addSource(source) {
      if (!source) return;

      this.sources = [source, ...this.sources];
    },

    removeSource(id) {
      this.sources = this.sources.filter((source) => source.id !== id);
    },
  },
});
