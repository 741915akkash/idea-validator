<script setup>
  import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
  import { useLeadsStore } from '~/stores/leads'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'

  import LeadDetailHeader from './Header.vue'
  import FollowUpSection from './FollowUpSection.vue'
  import ActivityFeed from './ActivityFeed.vue'
  import ContactInfo from './ContactInfo.vue'
  import LeadMeta from './Meta.vue'
  import ActivitySection from './ActivitySection.vue'
  import SequenceIndicator from './SequenceIndicator.vue'

  const props = defineProps({
    leadId: { type: Number, required: true }
  })

  const emit = defineEmits(['close'])

  const leadsStore = useLeadsStore()
  const quizStore = useQuizSessionStore()
  const lead = computed(() => leadsStore.leads.find((l) => l.id === props.leadId))

  // Inline Editing State
  const editingField = ref(null)
  const editValue = ref('')

  // Visual State
  const showMeta = ref(false)

  function startInlineEdit(field, value) {
    editingField.value = field
    editValue.value = value

    nextTick(() => {
      const el = document.getElementById(`edit-${field}`)
      if (el) el.focus()
    })
  }

  async function saveInlineEdit() {
    if (!editingField.value) return

    const field = editingField.value
    const value = editValue.value
    const previous = { ...lead.value }

    leadsStore.updateLead({ id: props.leadId, [field]: value })

    editingField.value = null

    try {
      const updated = await crmQuizFetch('/api/crm/leads/update', {
        method: 'PATCH',
        body: { id: props.leadId, field, value }
      })

      leadsStore.updateLead(updated)
    } catch {
      leadsStore.updateLead(previous)
    }
  }

  // ✅ FIXED outside click
  function handleOutsideClick() {
    if (editingField.value) {
      const confirmClose = confirm('Discard changes?')
      if (!confirmClose) return
    }

    emit('close')
  }

  // ✅ ESC key support (very useful)
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      handleOutsideClick()
    }
  }

  onMounted(async () => {
    const activities = await crmQuizFetch('/api/crm/activities/get-by-lead', {
      query: { leadId: props.leadId }
    })

    leadsStore.setActivities(props.leadId, activities)

    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<template>
  <!-- overlay -->
  <div class="fixed inset-0 z-[140] bg-black/20 dark:bg-black/60" @click="handleOutsideClick">
    <!-- modal -->
    <div
      v-if="lead"
      @click.stop
      class="animate-in slide-in-from-right fixed inset-y-0 right-0 z-[150] flex w-full max-w-[460px] flex-col overflow-hidden border-l border-app-border bg-app-panel text-app-text shadow-2xl duration-300"
    >
      <LeadDetailHeader
        :lead="lead"
        :editing-field="editingField"
        :edit-value="editValue"
        @close="$emit('close')"
        @start-edit="startInlineEdit"
        @save-edit="saveInlineEdit"
        @update-value="(v) => (editValue = v)"
      />

      <div class="custom-scrollbar flex-1 overflow-y-auto">
        <SequenceIndicator
          :lead-id="leadId"
          :sequence-id="lead.sequence?.id"
          :quiz-id="quizStore.quizId"
        />

        <FollowUpSection :lead-id="leadId" :follow-up="lead.follow_up" :sequence="lead.sequence" />

        <ActivitySection
          :activities="lead?.activities || []"
          :leadId="leadId"
          :quiz-id="quizStore.quizId"
        />

        <ActivityFeed :activities="lead.activities" />

        <ContactInfo
          :lead="lead"
          :editing-field="editingField"
          :edit-value="editValue"
          @start-edit="startInlineEdit"
          @save-edit="saveInlineEdit"
          @update-value="(v) => (editValue = v)"
        />

        <LeadMeta
          :lead="lead"
          :editing-field="editingField"
          :edit-value="editValue"
          :show-meta="showMeta"
          @toggle-meta="showMeta = !showMeta"
          @start-edit="startInlineEdit"
          @save-edit="saveInlineEdit"
          @update-value="(v) => (editValue = v)"
          @close="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
  }
</style>
