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
  <div class="bg-white p-6">
    <!-- HEADER -->
    <div class="mb-4 flex items-center justify-between">
      <h3
        class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
      >
        🤖 SEQUENCE
      </h3>

      <button
        @click="open = !open"
        class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-gray-600 shadow-sm transition-all hover:border-emerald-500 hover:text-emerald-600"
      >
        {{ open ? 'Close' : sequence ? 'Change' : 'Add Sequence' }}
      </button>
    </div>

    <!-- ACTIVE SEQUENCE -->
    <div
      v-if="sequence"
      @click="openSequence"
      class="group cursor-pointer rounded-xl border border-gray-200 bg-gray-50/30 p-4 transition-all hover:bg-gray-100"
    >
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Active Sequence
          </span>

          <span class="text-sm font-semibold text-gray-900">
            {{ sequence.name || sequence.title }}
          </span>

          <span v-if="sequence.current_step || sequence.total_steps" class="text-xs text-gray-500">
            Step {{ sequence.current_step || 0 }} of
            {{ sequence.total_steps || sequence.steps?.length || 0 }}
          </span>
        </div>

        <div
          class="mt-1 text-xs text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
        >
          →
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else class="rounded-xl border border-dashed border-gray-200 bg-gray-50/30 p-4">
      <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">
        No sequence assigned
      </span>
    </div>

    <!-- DROPDOWN -->
    <div v-if="open" class="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <!-- REMOVE SEQUENCE -->
      <button
        v-if="sequence"
        :disabled="loading"
        @click="assignSequence(null)"
        class="flex w-full items-center justify-between border-b border-red-100 bg-red-50/40 px-4 py-3 text-left transition-all hover:bg-red-50"
      >
        <div class="flex flex-col">
          <span class="text-sm font-medium text-red-700"> Remove Sequence </span>

          <span class="text-xs text-red-400"> Clear active automation </span>
        </div>

        <span class="text-xs text-red-300"> × </span>
      </button>

      <!-- SEQUENCES -->
      <button
        v-for="item in sequencesStore.sequences"
        :key="item.id"
        :disabled="loading"
        @click="assignSequence(item.id)"
        class="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left transition-all last:border-b-0 hover:bg-gray-50"
      >
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-800">
            {{ item.name || item.title }}
          </span>

          <span class="text-xs text-gray-400"> {{ item.steps?.length || 0 }} steps </span>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="String(sequence?.id) === String(item.id)"
            class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700"
          >
            Active
          </span>

          <span class="text-xs text-gray-300"> → </span>
        </div>
      </button>

      <!-- EMPTY STATE -->
      <div v-if="!sequencesStore.sequences.length" class="px-4 py-3 text-xs text-gray-400">
        No sequences found
      </div>
    </div>
  </div>
</template>
