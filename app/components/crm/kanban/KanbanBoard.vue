<script setup>
  import { computed, ref } from 'vue'
  import draggable from 'vuedraggable'
  import { useLeadsStore } from '~/stores/leads'
  import { useStagesStore } from '~/stores/stages'
  import KanbanColumn from './KanbanColumn.vue'
  import LeadDetailPanel from '../lead-detail/LeadDetailPanel.vue'

  const leadsStore = useLeadsStore()
  const stagesStore = useStagesStore()

  const stages = computed(() => stagesStore.stages)
  const selectedLeadId = ref(null)
  const showDetail = ref(false)

  function openLead(lead) {
    if (!lead?.id) return
    selectedLeadId.value = lead.id
    showDetail.value = true
  }

  function closeLead() {
    showDetail.value = false
    selectedLeadId.value = null
  }
</script>

<template>
  <div class="flex h-[calc(100vh-140px)] flex-col overflow-hidden">
    <!-- Scroll area -->
    <div class="custom-scrollbar flex flex-1 overflow-x-auto pb-4">
      <div class="flex min-w-max items-start gap-6">
        <KanbanColumn v-for="stage in stages" :key="stage.id" :stage="stage" @open-lead="openLead" />
      </div>
    </div>

    <LeadDetailPanel v-if="showDetail" :leadId="selectedLeadId" @close="closeLead" />
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
