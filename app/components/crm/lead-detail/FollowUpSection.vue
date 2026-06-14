<script setup>
  import { ref, computed } from 'vue'
  import { useLeadsStore } from '~/stores/leads'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'
  import { useSequencesStore } from '~/stores/sequences'

  const sequencesStore = useSequencesStore()

  const open = ref(false)
  const customDate = ref('')
  const isSaving = ref(false)

  const props = defineProps({
    leadId: { type: Number, required: true },

    followUp: String,

    sequence: {
      type: Object,
      default: null
    }
  })

  const leadsStore = useLeadsStore()

  const stepType = computed(() => {
    const type = props.sequence?.current_step_type

    if (!type) return ''

    if (type === 'email') return '✉️ Email'
    if (type === 'note') return '📝 Note'
    if (type === 'call') return '📞 Call'

    return ''
  })

  const currentStep = computed(() => {
    if (!props.sequence?.id || !props.sequence?.current_step) {
      return null
    }

    const fullSequence = sequencesStore.sequences.find(
      (s) => String(s.id) === String(props.sequence.id)
    )

    if (!fullSequence?.steps?.length) {
      return null
    }

    return fullSequence.steps.find(
      (step) => Number(step.step_number) === Number(props.sequence.current_step)
    )
  })

  const stepTitle = computed(() => {
    return currentStep.value?.title || 'Follow-up'
  })

  const stepText = computed(() => {
    return (
      currentStep.value?.text || currentStep.value?.content || currentStep.value?.description || ''
    )
  })

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

  function toWholeDaysLater(fromDate, toDate) {
    const start = new Date(fromDate)
    const end = new Date(toDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  function buildRescheduleActivityText({ selectedLabel, date }) {
    const baseDate = props.followUp ? new Date(props.followUp) : new Date()
    const daysLater = Math.max(0, toWholeDaysLater(baseDate, date))
    const title = stepTitle.value || 'Follow-up'
    const body = stepText.value ? ` | Step text: ${stepText.value}` : ''

    return `Rescheduled | Step: ${title}${body} | ${selectedLabel} (${daysLater} days later)`
  }

  async function createRescheduleActivity(payload) {
    try {
      const activity = await crmQuizFetch('/api/crm/activities/create', {
        method: 'POST',
        body: {
          leadId: props.leadId,
          type: 'note',
          text: buildRescheduleActivityText(payload)
        }
      })

      leadsStore.addActivity(props.leadId, activity)
    } catch (error) {
      console.error('Failed to create reschedule activity', error)
    }
  }

  async function rescheduleTo(date, selectedLabel) {
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
      await createRescheduleActivity({
        selectedLabel: selectedLabel || 'Custom',
        date
      })
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

    const label = type === 'today' ? 'Today' : type === 'tomorrow' ? 'Tomorrow' : '+3 days'
    await rescheduleTo(date, label)
  }

  async function applyCustomDate() {
    if (!customDate.value) return

    const picked = new Date(`${customDate.value}T00:00:00`)
    if (Number.isNaN(picked.getTime())) return

    const base = props.followUp ? new Date(props.followUp) : new Date()
    base.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate())

    await rescheduleTo(base, `Custom (${customDate.value})`)
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
      leadsStore.addActivity(props.leadId, {
        type: 'note',
        text: currentStep.value?.title
          ? `Completed sequence step ${props.sequence?.current_step}: ${currentStep.value.title}`
          : 'Follow-up marked done',
        created_at: new Date().toISOString()
      })

      if (props.sequence?.id && !updated?.sequence) {
        leadsStore.addActivity(props.leadId, {
          type: 'note',
          text: props.sequence?.name
            ? `Sequence "${props.sequence.name}" completed`
            : 'Sequence completed',
          created_at: new Date().toISOString()
        })
      }
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
  <div class="p-6 text-app-text">
    <!-- HEADER -->
    <h3
      class="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-app-muted"
    >
      🔥 FOLLOW-UP
    </h3>

    <!-- CARD -->
    <div class="bg-app-panel/30 relative rounded-xl border border-app-border p-5">
      <!-- HEADER ROW -->
      <div class="flex items-start justify-between gap-4">
        <!-- LEFT -->
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-app-muted">
            Next Action
          </span>

          <!-- TYPE + STATUS -->
          <div class="mt-1 flex items-center gap-2">
            <!-- TYPE -->
            <span v-if="stepType" class="text-sm font-semibold text-app-text">
              {{ stepType }}
            </span>

            <!-- STATUS -->
            <span
              v-if="status"
              class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
              :class="{
                'bg-emerald-600 text-white': status === 'today',
                'border border-app-border bg-app-card text-app-text': status === 'tomorrow',
                'bg-red-500/100/10 text-red-500': status === 'overdue'
              }"
            >
              {{ statusLabel() }}
            </span>
          </div>
        </div>

        <!-- RIGHT ACTIONS -->
        <div class="flex shrink-0 items-center gap-2">
          <!-- RESCHEDULE -->
          <button
            @click="toggle"
            :disabled="isSaving"
            class="rounded-lg border border-app-border px-3 py-1.5 text-[10px] font-bold uppercase text-app-text shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-60"
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

      <!-- STEP CARD -->
      <div
        v-if="stepTitle || stepText"
        class="mt-5 w-full rounded-xl border border-app-border p-5 text-app-text shadow-sm"
      >
        <!-- TITLE -->
        <div
          v-if="stepTitle"
          class="mb-3 text-[11px] font-bold uppercase tracking-wide text-app-muted"
        >
          {{ stepTitle }}
        </div>

        <!-- BODY -->
        <p v-if="stepText" class="whitespace-pre-wrap break-words text-sm leading-7 text-app-muted">
          {{ stepText }}
        </p>
      </div>

      <!-- DATE -->
      <span class="mt-5 block text-xs text-app-muted">
        {{ formatDate(followUp) }}
      </span>

      <!-- DROPDOWN -->
      <div
        v-if="open"
        class="absolute right-5 top-14 z-10 w-44 rounded-lg border border-app-border bg-app-panel text-app-text shadow-lg"
      >
        <button
          @click="setFollowUp('today')"
          class="w-full px-3 py-2 text-left text-xs text-app-muted hover:bg-app-panel"
        >
          Today
        </button>

        <button
          @click="setFollowUp('tomorrow')"
          class="w-full px-3 py-2 text-left text-xs text-app-muted hover:bg-app-panel"
        >
          Tomorrow
        </button>

        <button
          @click="setFollowUp('plus3d')"
          class="w-full px-3 py-2 text-left text-xs text-app-muted hover:bg-app-panel"
        >
          +3 days
        </button>

        <div class="border-t border-app-border p-2">
          <input
            v-model="customDate"
            type="date"
            class="mb-2 w-full rounded border border-app-border bg-app-card px-2 py-1 text-xs text-app-text outline-none focus:border-emerald-500"
          />

          <button
            @click="applyCustomDate"
            class="w-full rounded bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Apply Date
          </button>
        </div>

        <button
          @click="close"
          class="w-full border-t border-app-border px-3 py-2 text-left text-xs text-app-muted hover:bg-app-panel"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
