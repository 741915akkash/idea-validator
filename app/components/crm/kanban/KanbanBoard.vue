<script setup>
  import { computed } from 'vue'
  import draggable from 'vuedraggable'
  import { useLeadsStore } from '~/stores/leads'
  import { useStagesStore } from '~/stores/stages'
  import KanbanColumn from './KanbanColumn.vue'

  const leadsStore = useLeadsStore()
  const stagesStore = useStagesStore()

  const stages = computed(() => stagesStore.stages)
</script>

<template>
  <div class="custom-scrollbar flex h-full items-start gap-6 overflow-x-auto pb-4">
    <KanbanColumn v-for="stage in stages" :key="stage.id" :stage="stage" />
  </div>
</template>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    height: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
</style>
