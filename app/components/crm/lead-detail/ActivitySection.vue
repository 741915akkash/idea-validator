<script setup>
  import { ref, nextTick } from 'vue'
  import { MessageSquare, Phone, Mail, ChevronDown, X, Send, Mic } from 'lucide-vue-next'
  import { useLeadsStore } from '~/stores/leads'
  import { useRouter } from 'vue-router'
  import { crmQuizFetch } from '~/composables/useCrmRequest'
  import TopAlert from '~/components/ui/TopAlert.vue'

  const props = defineProps({
    leadId: { type: Number, required: true },
    quizId: { type: String, default: null },
    activities: { type: Array, default: () => [] }
  })

  const leadsStore = useLeadsStore()
  const router = useRouter()

  // Modal State
  const isModalOpen = ref(false)
  const activeType = ref('note') // 'note', 'call', 'email', 'x', 'linkedin'
  const text = ref('')
  const callOutcome = ref('Connected')
  const modalInput = ref(null)
  const showFreeformLimitAlert = ref(false)

  function openModal(type) {
    activeType.value = type
    text.value = ''
    isModalOpen.value = true

    nextTick(() => {
      modalInput.value?.focus()
    })
  }

  function closeModal() {
    isModalOpen.value = false
    text.value = ''
  }

  async function saveActivity() {
    if (!props.leadId) {
      console.error('Missing leadId, aborting')
      return
    }

    if (!text.value.trim()) return

    const typeLabels = {
      note: 'Note',
      call: 'Call',
      email: 'Email',
      x: 'X',
      linkedin: 'LinkedIn'
    }

    const typeLabel = typeLabels[activeType.value] || 'Activity'
    let activityText = text.value.trim()

    if (activeType.value === 'call') {
      activityText = `${typeLabel} — ${callOutcome.value}: ${activityText}`
    } else if (activeType.value === 'email') {
      activityText = `${typeLabel} — Sent: ${activityText}`
    } else {
      activityText = `${typeLabel}: ${activityText}`
    }

    const payload = {
      leadId: props.leadId,
      type: activeType.value,
      text: activityText
    }

    console.log('SENDING', payload)

    try {
      const activity = await crmQuizFetch('/api/crm/activities/create', {
        method: 'POST',
        body: payload
      })

      console.log('RESPONSE', activity)

      leadsStore.addActivity(props.leadId, activity)

      closeModal()
    } catch (e) {
      console.error('Failed to save activity', e)
    }
  }

  defineExpose({
    focus: () => openModal('note')
  })

  async function startInterviewFromLead() {
    const quizId = props.quizId
    if (!quizId) return
    showFreeformLimitAlert.value = false

    try {
      const started = await $fetch('/api/interview/freeform/start', {
        method: 'POST',
        body: { quiz_id: quizId }
      })

      if (!started?.interview_id) {
        throw new Error('Missing interview id')
      }

      const activity = await crmQuizFetch('/api/crm/activities/create', {
        method: 'POST',
        body: {
          leadId: props.leadId,
          type: 'interview',
          text: 'Started quick interview from lead detail',
          interviewId: started.interview_id
        }
      })

      leadsStore.addActivity(props.leadId, activity)

      await router.push({
        path: '/quiz/interviews',
        query: {
          quiz_id: quizId,
          open_interview_id: started.interview_id
        }
      })
    } catch (e) {
      const statusCode = Number(e?.statusCode || e?.data?.statusCode || 0)
      const statusMessage = String(e?.statusMessage || e?.data?.statusMessage || '')

      if (statusCode === 403 && statusMessage.includes('Freeform interview limit reached')) {
        showFreeformLimitAlert.value = true
        return
      }

      console.error('Failed to start quick interview', e)
    }
  }
</script>

<template>
  <div>
    <TopAlert
      :open="showFreeformLimitAlert"
      title="Freeform interview limit reached"
      variant="warning"
      message="Upgrade your plan to run more quick interviews for this idea in the current period."
      @close="showFreeformLimitAlert = false"
    />

    <div class="border-t border-app-border p-6 text-app-text">
      <h3
        class="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-app-muted"
      >
        ⚡️ QUICK ACTIONS
      </h3>

      <!-- QUICK ACTIONS -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <!-- NOTE -->
        <button
          @click="openModal('note')"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-emerald-200 hover:bg-emerald-500/10"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-emerald-600"
          >
            <MessageSquare class="h-4 w-4" />
          </div>

          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-emerald-500"
          >
            Note
          </span>
        </button>

        <!-- CALL -->
        <button
          @click="openModal('call')"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-blue-500/20 hover:bg-blue-500/5"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-blue-600"
          >
            <Phone class="h-4 w-4" />
          </div>

          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-blue-700"
          >
            Log Call
          </span>
        </button>

        <!-- EMAIL -->
        <button
          @click="openModal('email')"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-orange-500/30 hover:bg-orange-500/5"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-orange-600"
          >
            <Mail class="h-4 w-4" />
          </div>

          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-orange-700"
          >
            Email
          </span>
        </button>

        <!-- X -->
        <button
          @click="openModal('x')"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-emerald-600"
          >
            <span class="text-sm font-bold">𝕏</span>
          </div>

          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-emerald-700"
          >
            X
          </span>
        </button>

        <!-- LINKEDIN -->
        <button
          @click="openModal('linkedin')"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-emerald-600"
          >
            <span class="text-sm font-bold">in</span>
          </div>

          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-emerald-700"
          >
            LinkedIn
          </span>
        </button>
      </div>

      <!-- INTERVIEW -->
      <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          @click="startInterviewFromLead"
          :disabled="!quizId"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-violet-600"
          >
            <Mic class="h-4 w-4" />
          </div>

          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-violet-700"
          >
            Interview
          </span>
        </button>
      </div>

      <!-- ACTIVITY MODAL -->
      <Teleport to="body">
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
        >
          <!-- BACKDROP -->
          <div
            @click="closeModal"
            class="animate-in fade-in bg-app-panel/40 absolute inset-0 backdrop-blur-sm duration-200"
          ></div>

          <!-- MODAL -->
          <div
            class="animate-in zoom-in-95 slide-in-from-bottom-4 relative w-full max-w-lg overflow-hidden rounded-3xl bg-app-panel text-app-text shadow-2xl duration-300"
          >
            <!-- HEADER -->
            <header
              class="bg-app-panel/30 flex items-center justify-between border-b border-app-border px-6 py-4"
            >
              <div class="flex items-center gap-3">
                <!-- ICON -->
                <div
                  :class="[
                    'flex h-9 w-9 items-center justify-center rounded-xl text-app-text shadow-sm',
                    activeType === 'note'
                      ? 'bg-emerald-500/10'
                      : activeType === 'call'
                        ? 'bg-blue-500/10'
                        : activeType === 'email'
                          ? 'bg-orange-500/10'
                          : 'bg-violet-500/10'
                  ]"
                >
                  <template v-if="activeType === 'x'">
                    <span class="text-sm font-bold">𝕏</span>
                  </template>

                  <template v-else-if="activeType === 'linkedin'">
                    <span class="text-sm font-bold">in</span>
                  </template>

                  <component
                    v-else
                    :is="
                      activeType === 'note' ? MessageSquare : activeType === 'call' ? Phone : Mail
                    "
                    class="h-4 w-4"
                  />
                </div>

                <!-- TITLE -->
                <div>
                  <h2 class="text-sm font-bold uppercase tracking-widest text-app-text">
                    {{
                      activeType === 'note'
                        ? 'Add internal note'
                        : activeType === 'call'
                          ? 'Log phone call'
                          : activeType === 'email'
                            ? 'Log email sent'
                            : activeType === 'x'
                              ? 'Log X activity'
                              : 'Log LinkedIn activity'
                    }}
                  </h2>

                  <p class="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                    Recording activity for lead
                  </p>
                </div>
              </div>

              <!-- CLOSE -->
              <button
                @click="closeModal"
                class="rounded-full p-2 text-app-muted transition-colors hover:bg-app-hover"
              >
                <X class="h-5 w-5" />
              </button>
            </header>

            <!-- BODY -->
            <div class="p-6">
              <!-- CALL OUTCOME -->
              <div
                v-if="activeType === 'call'"
                class="mb-6 flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4"
              >
                <span class="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                  Call Outcome
                </span>

                <div class="relative min-w-[160px]">
                  <select
                    v-model="callOutcome"
                    class="w-full cursor-pointer appearance-none rounded-xl border border-blue-500/20 bg-app-card px-3 py-2 pr-10 text-xs font-bold text-app-text shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option>Connected</option>
                    <option>No answer</option>
                    <option>Busy</option>
                    <option>Left Voicemail</option>
                    <option>Wrong Number</option>
                  </select>

                  <ChevronDown
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500"
                  />
                </div>
              </div>

              <!-- ACTIVITY TEXT -->
              <textarea
                ref="modalInput"
                v-model="text"
                :placeholder="
                  activeType === 'note'
                    ? 'Write your internal updates here...'
                    : activeType === 'call'
                      ? 'What was discussed during the call?'
                      : activeType === 'email'
                        ? 'Summarize the email content...'
                        : activeType === 'x'
                          ? 'What happened on X? Reply, DM, post, interaction, etc.'
                          : 'What happened on LinkedIn? Message, connection, comment, etc.'
                "
                class="min-h-[160px] w-full resize-none rounded-2xl border border-app-border bg-app-card p-4 text-base font-medium text-app-text outline-none transition-all placeholder:text-app-muted focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              ></textarea>

              <!-- ACTIONS -->
              <div class="mt-6 flex items-center justify-end gap-3">
                <button
                  @click="closeModal"
                  class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-app-muted transition-colors hover:text-app-text"
                >
                  Cancel
                </button>

                <button
                  @click="saveActivity"
                  :disabled="!text.trim()"
                  :class="[
                    'flex items-center gap-2 rounded-xl px-8 py-2.5 text-xs font-bold uppercase tracking-widest shadow-lg transition-all',
                    !text.trim()
                      ? 'cursor-not-allowed border border-app-border bg-app-card text-app-muted shadow-none'
                      : activeType === 'note'
                        ? 'bg-emerald-600 text-app-text shadow-emerald-500/20 hover:bg-emerald-700'
                        : activeType === 'call'
                          ? 'bg-blue-600 text-app-text shadow-blue-500/20 hover:bg-blue-700'
                          : activeType === 'email'
                            ? 'bg-orange-600 text-app-text shadow-orange-500/20 hover:bg-orange-700'
                            : 'bg-violet-600 text-app-text shadow-violet-500/20 hover:bg-violet-700'
                  ]"
                >
                  <Send class="h-3.5 w-3.5" />
                  Save Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
