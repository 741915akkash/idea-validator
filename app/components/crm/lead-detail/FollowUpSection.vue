<script setup>
  import { ref, computed } from 'vue'
  import { useLeadsStore } from '~/stores/leads'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'

  const open = ref(false)
  const customDate = ref('')
  const isSaving = ref(false)

  const props = defineProps({
    leadId: { type: Number, required: true },
    followUp: String
  })

  const leadsStore = useLeadsStore()

  /* ---------- FORMAT ---------- */
  const formatDate = (dateString) => {
    if (!dateString) return 'No follow-up set'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  function toDateInputValue(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  /* ---------- DROPDOWN ---------- */
  function toggle() {
    open.value = !open.value
    if (open.value) {
      const base = props.followUp ? new Date(props.followUp) : new Date()
      customDate.value = toDateInputValue(base)
    }
  }

  function close() {
    open.value = false
  }

  async function rescheduleTo(date) {
    if (!date || Number.isNaN(date.getTime()) || isSaving.value) return

    const previous = leadsStore.leads.find((l) => l.id === props.leadId)
    if (!previous) return

    isSaving.value = true

    try {
      const updated = await crmQuizFetch('/api/crm/leads/follow-up/reschedule', {
        method: 'POST',
        body: {
          id: props.leadId,
          value: date.toISOString()
        }
      })

      leadsStore.updateLead(updated)
      close()
    } catch {
      leadsStore.updateLead(previous)
    } finally {
      isSaving.value = false
    }
  }

  /* ---------- RESCHEDULE ---------- */
  async function setFollowUp(type) {
    const now = new Date()
    const date = props.followUp ? new Date(props.followUp) : new Date()

    if (type === 'today') {
      date.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (type === 'tomorrow') {
      date.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    } else if (type === 'plus3d') {
      date.setDate(date.getDate() + 3)
    }

    await rescheduleTo(date)
  }

  async function applyCustomDate() {
    if (!customDate.value) return

    const picked = new Date(`${customDate.value}T00:00:00`)
    if (Number.isNaN(picked.getTime())) return

    const base = props.followUp ? new Date(props.followUp) : new Date()
    base.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate())

    await rescheduleTo(base)
  }

  /* ---------- MARK DONE ---------- */
  async function markDone() {
    if (isSaving.value) return

    const previous = leadsStore.leads.find((l) => l.id === props.leadId)
    if (!previous) return

    isSaving.value = true

    try {
      const updated = await crmQuizFetch('/api/crm/leads/follow-up/done', {
        method: 'POST',
        body: { id: props.leadId }
      })

      leadsStore.updateLead(updated)
    } catch {
      leadsStore.updateLead(previous)
    } finally {
      isSaving.value = false
    }
  }

  /* ---------- STATUS ---------- */
  const status = computed(() => {
    if (!props.followUp) return null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const follow = new Date(props.followUp)
    const followDay = new Date(follow.getFullYear(), follow.getMonth(), follow.getDate())

    if (followDay.getTime() === today.getTime()) return 'today'
    if (followDay.getTime() === tomorrow.getTime()) return 'tomorrow'
    if (follow < now) return 'overdue'

    return null
  })

  function statusLabel() {
    if (status.value === 'today') return 'Today'
    if (status.value === 'tomorrow') return 'Tomorrow'
    if (status.value === 'overdue') return 'Overdue'
    return ''
  }
</script>

<template>
  <div class="bg-white p-6">
    <!-- HEADER -->
    <h3
      class="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
    >
      🔥 FOLLOW-UP
    </h3>

    <!-- CARD -->
    <div class="relative rounded-xl border border-gray-200 bg-gray-50/30 p-4">
      <!-- TOP ROW -->
      <div class="mb-3 flex items-start justify-between">
        <!-- LEFT -->
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Next Action
          </span>

          <!-- TYPE + STATUS -->
          <div class="flex items-center gap-2">
            <!-- TYPE -->
            <span class="text-sm font-semibold text-gray-900"> 📞 Call </span>

            <!-- STATUS BADGE -->
            <span
              class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white"
              :class="{
                'bg-emerald-600': status === 'today',
                'bg-gray-600': status === 'tomorrow',
                'bg-red-600': status === 'overdue'
              }"
            >
              {{ statusLabel() }}
            </span>
          </div>

          <!-- DATE -->
          <span class="text-xs text-gray-500">
            {{ formatDate(followUp) }}
          </span>
        </div>

        <!-- RIGHT ACTIONS -->
        <div class="flex items-center gap-2">
          <!-- RESCHEDULE -->
          <button
            @click="toggle"
            :disabled="isSaving"
            class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-gray-600 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-60"
          >
            Reschedule ▾
          </button>

          <!-- DONE -->
          <button
            @click="markDone"
            :disabled="isSaving"
            class="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            Done
          </button>
        </div>
      </div>

      <!-- DROPDOWN -->
      <div
        v-if="open"
        class="absolute right-4 top-14 z-10 w-44 rounded-lg border border-gray-200 bg-white shadow-lg"
      >
        <button
          @click="setFollowUp('today')"
          class="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-100"
        >
          Today
        </button>

        <button
          @click="setFollowUp('tomorrow')"
          class="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-100"
        >
          Tomorrow
        </button>

        <button
          @click="setFollowUp('plus3d')"
          class="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-100"
        >
          +3 days
        </button>

        <div class="border-t border-gray-100 p-2">
          <input
            v-model="customDate"
            type="date"
            class="mb-2 w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-700"
          />
          <button
            @click="applyCustomDate"
            class="w-full rounded bg-gray-900 px-2 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
          >
            Apply Date
          </button>
        </div>

        <button
          @click="close"
          class="w-full border-t border-gray-100 px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
