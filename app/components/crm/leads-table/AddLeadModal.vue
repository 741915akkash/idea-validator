<script setup>
import { onMounted, ref, watch } from 'vue'
import { useLeadsStore } from '~/stores/leads'
import { usePipelinesStore } from '~/stores/pipelines'
import { useUsersStore } from '~/stores/users'
import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'
import TopAlert from '~/components/ui/TopAlert.vue'

const emit = defineEmits(['close'])

const pipelinesStore = usePipelinesStore()
const usersStore = useUsersStore()
const leadsStore = useLeadsStore()

const name = ref('')
const company = ref('')
const email = ref('')
const phone = ref('')

const pipelineId = ref(null)
const stageId = ref(null)
const pipelineStages = ref([])

const userId = ref(null)
const sequenceId = ref('')
const sequences = ref([])

const emailError = ref('')
const phoneError = ref('')
const showContactsLimitAlert = ref(false)
const isLoadingStages = ref(false)

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function normalizePhone(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  const hasPlusPrefix = raw.startsWith('+')
  const digitsOnly = raw.replace(/\D/g, '')

  return hasPlusPrefix ? `+${digitsOnly}` : digitsOnly
}

function isValidPhone(value) {
  if (!value) return true
  return /^\+?[1-9]\d{7,14}$/.test(value)
}

watch(email, (value) => {
  const normalized = String(value || '').trim()

  if (!normalized) {
    emailError.value = ''
    return
  }

  emailError.value = isValidEmail(normalized)
    ? ''
    : 'Enter a valid email address'
})

watch(phone, (value) => {
  const normalized = normalizePhone(value)

  if (!normalized) {
    phoneError.value = ''
    return
  }

  phoneError.value = isValidPhone(normalized)
    ? ''
    : 'Enter a valid phone number'
})

async function loadPipelineStages(id) {
  if (!id) {
    pipelineStages.value = []
    stageId.value = null
    return
  }

  isLoadingStages.value = true
  pipelineStages.value = []
  stageId.value = null

  try {
    const stages = await crmGlobalFetch(
      `/api/crm/pipelines/stages?pipelineId=${id}`
    )

    pipelineStages.value = Array.isArray(stages) ? stages : []

    if (pipelineStages.value.length > 0) {
      stageId.value = pipelineStages.value[0].id
    }
  } catch (error) {
    console.error('Failed to load pipeline stages', error)
    pipelineStages.value = []
    stageId.value = null
  } finally {
    isLoadingStages.value = false
  }
}

watch(pipelineId, async (id, oldId) => {
  if (id === oldId) return

  await loadPipelineStages(id)
})

onMounted(async () => {
  try {
    sequences.value = await crmGlobalFetch('/api/crm/sequences')
  } catch {
    sequences.value = []
  }

  if (usersStore.users.length === 0) {
    try {
      const users = await crmGlobalFetch('/api/crm/users')
      usersStore.setUsers(users)
    } catch {
      usersStore.setUsers([])
    }
  }

  // Use the currently active pipeline as the default.
  // Fall back to the first pipeline if no active pipeline is set.
  if (pipelinesStore.activePipelineId) {
    pipelineId.value = pipelinesStore.activePipelineId
  } else if (pipelinesStore.pipelines.length > 0) {
    pipelineId.value = pipelinesStore.pipelines[0].id
  }

  if (pipelineId.value) {
    await loadPipelineStages(pipelineId.value)
  }
})

async function createLead() {
  const normalizedEmail = String(email.value || '').trim()
  const normalizedPhone = normalizePhone(phone.value)

  if (!isValidEmail(normalizedEmail)) {
    emailError.value = 'Enter a valid email address'
    return
  }

  if (!isValidPhone(normalizedPhone)) {
    phoneError.value = 'Enter a valid phone number'
    return
  }

  if (!pipelineId.value) {
    console.error('Cannot create lead without a pipeline')
    return
  }

  if (!stageId.value) {
    console.error('Cannot create lead without a stage')
    return
  }

  showContactsLimitAlert.value = false

  try {
    const lead = await crmQuizFetch('/api/crm/leads/create', {
      method: 'POST',
      body: {
        name: name.value,
        company: company.value,
        email: normalizedEmail,
        phone: normalizedPhone || null,
        pipeline_id: pipelineId.value,
        stage_id: stageId.value,
        user_id: userId.value,
        sequence_id: sequenceId.value || null
      }
    })

    leadsStore.addLead(lead)
    emit('close')
  } catch (error) {
    const statusCode = Number(
      error?.statusCode ||
      error?.data?.statusCode ||
      0
    )

    const statusMessage = String(
      error?.statusMessage ||
      error?.data?.statusMessage ||
      ''
    )

    if (
      statusCode === 403 &&
      statusMessage.includes('Contacts limit reached')
    ) {
      showContactsLimitAlert.value = true
      return
    }

    console.error('Failed to create lead', error)
  }
}
</script>

<template>
  <TopAlert
    :open="showContactsLimitAlert"
    title="Contacts limit reached"
    variant="warning"
    message="Upgrade your plan to add more contacts, or archive/delete existing leads to free up capacity."
    @close="showContactsLimitAlert = false"
  />

  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
  >
    <div
      class="w-96 rounded-xl border border-app-border bg-app-panel p-6 text-app-text shadow-2xl"
      @click.stop
    >
      <h2 class="mb-6 text-xl font-bold text-app-text">
        Add Lead
      </h2>

      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label
            class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
          >
            Full Name
          </label>

          <input
            v-model="name"
            placeholder="John Doe"
            class="w-full rounded-lg border border-app-border bg-app-card p-2.5 text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <!-- Company -->
        <div>
          <label
            class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
          >
            Company
          </label>

          <input
            v-model="company"
            placeholder="Acme Inc."
            class="w-full rounded-lg border border-app-border bg-app-card p-2.5 text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <!-- Email -->
        <div>
          <label
            class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
          >
            Email Address
          </label>

          <input
            v-model="email"
            placeholder="john@example.com"
            class="w-full rounded-lg border bg-app-card p-2.5 text-app-text outline-none transition-all placeholder:text-app-muted focus:ring-2"
            :class="
              emailError
                ? 'border-red-500/20 focus:border-red-500/20 focus:ring-red-500/20'
                : 'border-app-border focus:border-emerald-500 focus:ring-emerald-500/20'
            "
          />

          <p
            v-if="emailError"
            class="mt-1 text-xs font-medium text-red-500"
          >
            {{ emailError }}
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label
            class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
          >
            Phone Number
          </label>

          <input
            v-model="phone"
            placeholder="+14155552671"
            class="w-full rounded-lg border bg-app-card p-2.5 text-app-text outline-none transition-all placeholder:text-app-muted focus:ring-2"
            :class="
              phoneError
                ? 'border-red-500/20 focus:border-red-500/20 focus:ring-red-500/20'
                : 'border-app-border focus:border-emerald-500 focus:ring-emerald-500/20'
            "
          />

          <p
            v-if="phoneError"
            class="mt-1 text-xs font-medium text-red-500"
          >
            {{ phoneError }}
          </p>
        </div>

        <!-- Pipeline -->
        <div>
          <label
            class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
          >
            Pipeline
          </label>

          <select
            v-model="pipelineId"
            class="w-full rounded-lg border border-app-border bg-app-card p-2.5 text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option
              v-for="pipeline in pipelinesStore.pipelines"
              :key="pipeline.id"
              :value="pipeline.id"
            >
              {{ pipeline.name }}
            </option>
          </select>
        </div>

        <!-- Stage + Owner -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Stage -->
          <div>
            <label
              class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
            >
              Stage
            </label>

            <select
              v-model="stageId"
              :disabled="isLoadingStages || !pipelineId"
              class="w-full rounded-lg border border-app-border bg-app-card p-2.5 text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option
                v-if="isLoadingStages"
                :value="null"
              >
                Loading...
              </option>

              <option
                v-else-if="!pipelineStages.length"
                :value="null"
              >
                No stages
              </option>

              <option
                v-for="stage in pipelineStages"
                v-else
                :key="stage.id"
                :value="stage.id"
              >
                {{ stage.name }}
              </option>
            </select>
          </div>

          <!-- Owner -->
          <div>
            <label
              class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
            >
              Owner
            </label>

            <select
              v-model="userId"
              class="w-full rounded-lg border border-app-border bg-app-card p-2.5 text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option
                v-for="user in usersStore.users"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name || user.email }}
              </option>
            </select>
          </div>
        </div>

        <!-- Sequence -->
        <div>
          <label
            class="mb-1 block text-xs font-semibold uppercase tracking-wider text-app-muted"
          >
            Sequence
          </label>

          <select
            v-model="sequenceId"
            class="w-full rounded-lg border border-app-border bg-app-card p-2.5 text-app-text outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">
              None
            </option>

            <option
              v-for="sequence in sequences"
              :key="sequence.id"
              :value="sequence.id"
            >
              {{ sequence.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-8 flex justify-end gap-3">
        <button
          class="rounded-lg border border-app-border px-4 py-2 font-medium text-app-muted transition-colors hover:bg-app-hover hover:text-app-text"
          @click="$emit('close')"
        >
          Cancel
        </button>

        <button
          class="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoadingStages || !pipelineId || !stageId"
          @click="createLead"
        >
          Create Lead
        </button>
      </div>
    </div>
  </div>
</template>