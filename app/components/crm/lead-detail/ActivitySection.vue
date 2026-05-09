<script setup>
  import { ref, nextTick } from 'vue'
  import { MessageSquare, Phone, Mail, ChevronDown, X, Send, Mic } from 'lucide-vue-next'
  import { useLeadsStore } from '~/stores/leads'
  import { useRouter } from 'vue-router'
  import { crmFetch } from '~/composables/useCrmRequest'

  const props = defineProps({
    leadId: { type: Number, required: true },
    quizId: { type: String, default: null }
  })

  const leadsStore = useLeadsStore()
  const router = useRouter()

  // Modal State
  const isModalOpen = ref(false)
  const activeType = ref('note') // 'note', 'call', 'email'
  const text = ref('')
  const callOutcome = ref('Connected')
  const modalInput = ref(null)

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
      const activity = await crmFetch('/api/crm/activities/create', {
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

    try {
      const started = await $fetch('/api/interview/freeform/start', {
        method: 'POST',
        body: { quiz_id: quizId }
      })

      if (!started?.interview_id) {
        throw new Error('Missing interview id')
      }

      const activity = await crmFetch('/api/crm/activities/create', {
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
      console.error('Failed to start quick interview', e)
    }
  }
</script>

<template>
  <div class="border-t border-gray-50 bg-white p-6">
    <h3
      class="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
    >
      ⚡️ QUICK ACTIONS
    </h3>

    <div class="grid grid-cols-3 gap-3">
      <button
        @click="openModal('note')"
        class="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50"
      >
        <div
          class="rounded-lg bg-white p-2 shadow-sm transition-colors group-hover:text-emerald-600"
        >
          <MessageSquare class="h-4 w-4" />
        </div>
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-emerald-700"
          >Note</span
        >
      </button>

      <button
        @click="openModal('call')"
        class="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
      >
        <div class="rounded-lg bg-white p-2 shadow-sm transition-colors group-hover:text-blue-600">
          <Phone class="h-4 w-4" />
        </div>
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-blue-700"
          >Log Call</span
        >
      </button>

      <button
        @click="openModal('email')"
        class="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-orange-200 hover:bg-orange-50"
      >
        <div
          class="rounded-lg bg-white p-2 shadow-sm transition-colors group-hover:text-orange-600"
        >
          <Mail class="h-4 w-4" />
        </div>
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-orange-700"
          >Email</span
        >
      </button>
    </div>

    <div class="mt-3 grid grid-cols-3 gap-3">
      <button
        @click="startInterviewFromLead"
        :disabled="!quizId"
        class="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div
          class="rounded-lg bg-white p-2 shadow-sm transition-colors group-hover:text-violet-600"
        >
          <Mic class="h-4 w-4" />
        </div>
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-violet-700"
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
          class="animate-in zoom-in-95 slide-in-from-bottom-4 relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl duration-300"
        >
          <header
            class="flex items-center justify-between border-b border-gray-100 bg-gray-50/30 px-6 py-4"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'rounded-xl p-2 text-white shadow-sm',
                  activeType === 'note'
                    ? 'bg-emerald-500'
                    : activeType === 'call'
                      ? 'bg-blue-500'
                      : 'bg-orange-500'
                ]"
              >
                <component
                  :is="activeType === 'note' ? MessageSquare : activeType === 'call' ? Phone : Mail"
                  class="h-4 w-4"
                />
              </div>
              <div>
                <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900">
                  {{
                    activeType === 'note'
                      ? 'Add internal note'
                      : activeType === 'call'
                        ? 'Log phone call'
                        : 'Log email sent'
                  }}
                </h2>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Recording activity for lead
                </p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100"
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
                  class="w-full cursor-pointer appearance-none rounded-xl border border-blue-200 bg-white px-3 py-2 pr-10 text-xs font-bold text-blue-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
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
              class="min-h-[160px] w-full resize-none rounded-2xl border-none border-gray-100 bg-gray-50/30 p-4 text-base font-medium placeholder-gray-300 outline-none transition-all focus:ring-2 focus:ring-gray-100"
            ></textarea>

            <div class="mt-6 flex items-center justify-end gap-3">
              <button
                @click="closeModal"
                class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                @click="saveActivity"
                :disabled="!text.trim()"
                :class="[
                  'flex items-center gap-2 rounded-xl px-8 py-2.5 text-xs font-bold uppercase tracking-widest shadow-lg transition-all',
                  !text.trim()
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 shadow-none'
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
</template>
