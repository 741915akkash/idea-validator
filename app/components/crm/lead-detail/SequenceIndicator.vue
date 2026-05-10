<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSequencesStore } from '~/stores/sequences'

  const props = defineProps({
    leadId: {
      type: [String, Number],
      required: true
    },

    sequenceId: {
      type: [String, Number],
      default: null
    }
  })

  const router = useRouter()
  const sequencesStore = useSequencesStore()

  const loading = ref(false)
  const open = ref(false)

  onMounted(async () => {
    if (!sequencesStore.sequences.length) {
      await sequencesStore.fetchSequences()
    }
  })

  const sequence = computed(() =>
    sequencesStore.sequences.find((item) => String(item.id) === String(props.sequenceId))
  )

  async function assignSequence(sequenceId) {
    try {
      loading.value = true

      await $fetch('/api/crm/leads/set-sequence', {
        method: 'PATCH',
        body: {
          lead_id: props.leadId,
          sequence_id: sequenceId
        }
      })

      open.value = false

      // optional refresh
      window.location.reload()
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
    <h3
      class="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
    >
      🤖 SEQUENCE
    </h3>

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
      <div class="flex flex-col gap-3">
        <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          No sequence
        </span>

        <!-- BUTTON -->
        <button
          @click="open = !open"
          class="self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-gray-600 shadow-sm transition-all hover:border-emerald-500 hover:text-emerald-600"
        >
          Add Sequence
        </button>

        <!-- DROPDOWN -->
        <div v-if="open" class="overflow-hidden rounded-xl border border-gray-200 bg-white">
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

            <span class="text-xs text-gray-300"> → </span>
          </button>

          <div v-if="!sequencesStore.sequences.length" class="px-4 py-3 text-xs text-gray-400">
            No sequences found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
