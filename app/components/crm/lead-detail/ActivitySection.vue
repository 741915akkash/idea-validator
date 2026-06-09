<script setup>
  import { ref, nextTick } from 'vue'
  import { MessageSquare, Phone, Mail, ChevronDown, X, Send, Mic } from 'lucide-vue-next'
  import { useLeadsStore } from '~/stores/leads'
  import { useRouter } from 'vue-router'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'
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
  const activeType = ref('note') // 'note', 'call', 'email'
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

    let typeLabel = activeType.value.charAt(0).toUpperCase() + activeType.value.slice(1)
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

      closeModal() // ✅ AFTER success
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

      <div class="grid grid-cols-3 gap-3">
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
            >Note</span
          >
        </button>

        <button
          @click="openModal('call')"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-blue-600"
          >
            <Phone class="h-4 w-4" />
          </div>
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-blue-700"
            >Log Call</span
          >
        </button>

        <button
          @click="openModal('email')"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-orange-200 hover:bg-orange-50"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-orange-600"
          >
            <Mail class="h-4 w-4" />
          </div>
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-orange-700"
            >Email</span
          >
        </button>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-3">
        <button
          @click="startInterviewFromLead"
          :disabled="!quizId"
          class="bg-app-panel/50 group flex flex-col items-center justify-center gap-2 rounded-2xl border border-app-border p-4 transition-all hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div
            class="rounded-lg p-2 text-app-text shadow-sm transition-colors group-hover:text-violet-600"
          >
            <Mic class="h-4 w-4" />
          </div>
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-app-muted group-hover:text-violet-700"
            >Interview</span
          >
        </button>
      </div>

      <!-- Activity Modal -->
      <Teleport to="body">
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
        >
          <!-- Backdrop -->
          <div
            @click="closeModal"
            class="animate-in fade-in absolute inset-0 bg-gray-900/40 backdrop-blur-sm duration-200"
          ></div>

          <!-- Modal Content -->
          <div
            class="animate-in zoom-in-95 slide-in-from-bottom-4 relative w-full max-w-lg overflow-hidden rounded-3xl text-app-text shadow-2xl duration-300"
          >
            <header
              class="bg-app-panel/30 flex items-center justify-between border-b border-app-border px-6 py-4"
            >
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'rounded-xl p-2 text-white shadow-sm',
                    activeType === 'note'
                      ? 'bg-emerald-500/10'
                      : activeType === 'call'
                        ? 'bg-blue-500'
                        : 'bg-orange-500'
                  ]"
                >
                  <component
                    :is="
                      activeType === 'note' ? MessageSquare : activeType === 'call' ? Phone : Mail
                    "
                    class="h-4 w-4"
                  />
                </div>
                <div>
                  <h2 class="text-sm font-bold uppercase tracking-widest text-app-text">
                    {{
                      activeType === 'note'
                        ? 'Add internal note'
                        : activeType === 'call'
                          ? 'Log phone call'
                          : 'Log email sent'
                    }}
                  </h2>
                  <p class="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                    Recording activity for lead
                  </p>
                </div>
              </div>
              <button
                @click="closeModal"
                class="rounded-full p-2 text-app-muted transition-colors hover:bg-gray-100"
              >
                <X class="h-5 w-5" />
              </button>
            </header>

            <div class="p-6">
              <!-- Specific Fields -->
              <div
                v-if="activeType === 'call'"
                class="mb-6 flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
              >
                <span class="text-[11px] font-bold uppercase tracking-wider text-blue-800"
                  >Call Outcome</span
                >
                <div class="relative min-w-[160px]">
                  <select
                    v-model="callOutcome"
                    class="w-full cursor-pointer appearance-none rounded-xl border border-blue-200 px-3 py-2 pr-10 text-xs font-bold text-app-text text-blue-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option>Connected</option>
                    <option>No answer</option>
                    <option>Busy</option>
                    <option>Left Voicemail</option>
                    <option>Wrong Number</option>
                  </select>
                  <ChevronDown
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400"
                  />
                </div>
              </div>

              <textarea
                ref="modalInput"
                v-model="text"
                :placeholder="
                  activeType === 'note'
                    ? 'Write your internal updates here...'
                    : activeType === 'call'
                      ? 'What was discussed during the call?'
                      : 'Summarize the email content...'
                "
                class="bg-app-panel/30 min-h-[160px] w-full resize-none rounded-2xl border-none border-app-border p-4 text-base font-medium placeholder-gray-300 outline-none transition-all focus:ring-2 focus:ring-gray-100"
              ></textarea>

              <div class="mt-6 flex items-center justify-end gap-3">
                <button
                  @click="closeModal"
                  class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-app-muted transition-colors hover:text-app-muted"
                >
                  Cancel
                </button>
                <button
                  @click="saveActivity"
                  :disabled="!text.trim()"
                  :class="[
                    'flex items-center gap-2 rounded-xl px-8 py-2.5 text-xs font-bold uppercase tracking-widest shadow-lg transition-all',
                    !text.trim()
                      ? 'cursor-not-allowed bg-gray-100 text-app-muted shadow-none'
                      : activeType === 'note'
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'
                        : activeType === 'call'
                          ? 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                          : 'bg-orange-600 text-white shadow-orange-500/20 hover:bg-orange-700'
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
