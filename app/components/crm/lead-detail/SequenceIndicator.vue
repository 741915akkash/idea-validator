<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSequencesStore } from '~/stores/sequences'
  import { useLeadsStore } from '~/stores/leads'
  import { crmQuizFetch } from '~/composables/useCrmRequest'

  const props = defineProps({
    leadId: {
      type: [String, Number],
      required: true
    },

    sequenceId: {
      type: [String, Number],
      default: null
    },

    quizId: {
      type: [String, Number],
      required: true
    }
  })

  const router = useRouter()
  const sequencesStore = useSequencesStore()
  const leadsStore = useLeadsStore()

  const loading = ref(false)
  const open = ref(false)

  onMounted(async () => {
    if (!sequencesStore.sequences.length) {
      await sequencesStore.fetchSequences()
    }
  })

  const activeSequenceId = ref(props.sequenceId)

  watch(
    () => props.sequenceId,
    (next) => {
      activeSequenceId.value = next
    }
  )

  const sequence = computed(() =>
    sequencesStore.sequences.find((item) => String(item.id) === String(activeSequenceId.value))
  )

  async function assignSequence(sequenceId) {
    try {
      loading.value = true

      const previousSequence = sequence.value

      const updated = await $fetch('/api/crm/leads/sequence/set-sequence', {
        method: 'PATCH',
        body: {
          lead_id: props.leadId,
          sequence_id: sequenceId,
          quiz_id: props.quizId
        }
      })

      leadsStore.updateLead(updated)

      // REMOVED
      if (sequenceId === null && (previousSequence?.name || previousSequence?.title)) {
        const activity = await crmQuizFetch('/api/crm/activities/create', {
          method: 'POST',
          body: {
            leadId: props.leadId,
            type: 'note',
            text: `Removed sequence "${previousSequence.name || previousSequence.title}" from lead`
          }
        })

        leadsStore.addActivity(Number(props.leadId), activity)
      }

      // ADDED / CHANGED
      if (sequenceId !== null) {
        const newSequence = sequencesStore.sequences.find(
          (item) => String(item.id) === String(sequenceId)
        )

        if (newSequence?.name || newSequence?.title) {
          const activity = await crmQuizFetch('/api/crm/activities/create', {
            method: 'POST',
            body: {
              leadId: props.leadId,
              type: 'note',
              text: `Added sequence "${newSequence.name || newSequence.title}" to lead`
            }
          })

          leadsStore.addActivity(Number(props.leadId), activity)
        }
      }

      activeSequenceId.value = sequenceId
      open.value = false
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  function openSequence() {
    if (!sequence.value?.id) return

    router.push(`/crm/sequences/${sequence.value.id}`)
  }
</script>

<template>
  <div class="p-6 text-app-text">
    <!-- HEADER -->
    <div class="mb-4 flex items-center justify-between">
      <h3
        class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-app-muted"
      >
        🤖 SEQUENCE
      </h3>

      <button
        @click="open = !open"
        class="rounded-lg border border-app-border px-3 py-1.5 text-[10px] font-bold uppercase text-app-muted text-app-text shadow-sm transition-all hover:border-emerald-500 hover:text-emerald-600"
      >
        {{ open ? 'Close' : sequence ? 'Change' : 'Add Sequence' }}
      </button>
    </div>

    <!-- ACTIVE SEQUENCE -->
    <div
      v-if="sequence"
      @click="openSequence"
      class="bg-app-panel/30 group cursor-pointer rounded-xl border border-app-border p-4 transition-all hover:bg-app-hover"
    >
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-app-muted">
            Active Sequence
          </span>

          <span class="text-sm font-semibold text-app-text">
            {{ sequence.name || sequence.title }}
          </span>

          <span v-if="sequence.current_step || sequence.total_steps" class="text-xs text-app-muted">
            Step {{ sequence.current_step || 0 }} of
            {{ sequence.total_steps || sequence.steps?.length || 0 }}
          </span>
        </div>

        <div
          class="mt-1 text-xs text-app-muted transition group-hover:translate-x-0.5 group-hover:text-app-text"
        >
          →
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else class="bg-app-panel/30 rounded-xl border border-dashed border-app-border p-4">
      <span class="text-[11px] font-bold uppercase tracking-wider text-app-muted">
        No sequence assigned
      </span>
    </div>

    <!-- DROPDOWN -->
    <div
      v-if="open"
      class="mt-4 overflow-hidden rounded-xl border border-app-border bg-app-panel text-app-text"
    >
      <!-- REMOVE SEQUENCE -->
      <button
        v-if="sequence"
        :disabled="loading"
        @click="assignSequence(null)"
        class="bg-red-500/100/5/5 hover:bg-red-500/100/5/10 border-red-500/20/20 flex w-full items-center justify-between border-b px-4 py-3 text-left transition-all"
      >
        <div class="flex flex-col">
          <span class="text-sm font-medium text-red-500"> Remove Sequence </span>

          <span class="text-xs text-red-500"> Clear active automation </span>
        </div>

        <span class="text-xs text-red-500"> × </span>
      </button>

      <!-- SEQUENCES -->
      <button
        v-for="item in sequencesStore.sequences"
        :key="item.id"
        :disabled="loading"
        @click="assignSequence(item.id)"
        class="flex w-full items-center justify-between border-b border-app-border px-4 py-3 text-left transition-all last:border-b-0 hover:bg-app-panel"
      >
        <div class="flex flex-col">
          <span class="text-sm font-medium text-app-text">
            {{ item.name || item.title }}
          </span>

          <span class="text-xs text-app-muted"> {{ item.steps?.length || 0 }} steps </span>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="String(sequence?.id) === String(item.id)"
            class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-500"
          >
            Active
          </span>

          <span class="text-xs text-app-muted"> → </span>
        </div>
      </button>

      <!-- EMPTY STATE -->
      <div v-if="!sequencesStore.sequences.length" class="px-4 py-3 text-xs text-app-muted">
        No sequences found
      </div>
    </div>
  </div>
</template>
