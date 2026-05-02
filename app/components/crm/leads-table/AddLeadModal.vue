<script setup>
  import { onMounted, ref, watch } from 'vue'
  import { useLeadsStore } from '~/stores/leads'
  import { useStagesStore } from '~/stores/stages'
  import { useUsersStore } from '~/stores/users'

  const emit = defineEmits(['close'])

  const stagesStore = useStagesStore()
  const usersStore = useUsersStore()
  const leadsStore = useLeadsStore()

  const name = ref('')
  const company = ref('')
  const email = ref('')
  const phone = ref('')
  const stageId = ref(null)
  const userId = ref(null)
  const sequenceId = ref('')
  const sequences = ref([])
  const emailError = ref('')
  const phoneError = ref('')

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
    emailError.value = isValidEmail(normalized) ? '' : 'Enter a valid email address'
  })

  watch(phone, (value) => {
    const normalized = normalizePhone(value)
    if (!normalized) {
      phoneError.value = ''
      return
    }
    phoneError.value = isValidPhone(normalized) ? '' : 'Enter a valid phone number'
  })

  watch(
    () => stagesStore.stages,
    (stages) => {
      if (!stageId.value && stages.length > 0) {
        stageId.value = stages[0].id
      }
    },
    { immediate: true }
  )

  watch(
    () => usersStore.users,
    (users) => {
      if (!userId.value && users.length > 0) {
        userId.value = users[0].id
      }
    },
    { immediate: true }
  )

  onMounted(async () => {
    try {
      sequences.value = await $fetch('/api/crm/sequences')
    } catch {
      sequences.value = []
    }

    if (usersStore.users.length > 0) return

    try {
      const users = await $fetch('/api/crm/users')
      usersStore.setUsers(users)
    } catch {
      usersStore.setUsers([])
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

    try {
      const lead = await $fetch('/api/crm/leads/create', {
        method: 'POST',
        body: {
          name: name.value,
          company: company.value,
          email: normalizedEmail,
          phone: normalizedPhone || null,
          stage_id: stageId.value,
          user_id: userId.value,
          sequence_id: sequenceId.value || null
        }
      })

      leadsStore.addLead(lead)
      console.log('STORE LEADS:', leadsStore.leads)
    } finally {
      emit('close')
    }
  }
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
      <h2 class="mb-6 text-xl font-bold text-gray-900">Add Lead</h2>

      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Full Name
          </label>
          <input
            v-model="name"
            placeholder="John Doe"
            class="w-full rounded-lg border border-gray-300 p-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <!-- Company -->
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Company
          </label>
          <input
            v-model="company"
            placeholder="Acme Inc."
            class="w-full rounded-lg border border-gray-300 p-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Email Address
          </label>
          <input
            v-model="email"
            placeholder="john@example.com"
            class="w-full rounded-lg border p-2.5 outline-none transition-all focus:ring-2"
            :class="
              emailError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            "
          />
          <p v-if="emailError" class="mt-1 text-xs font-medium text-rose-600">
            {{ emailError }}
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Phone Number
          </label>
          <input
            v-model="phone"
            placeholder="+14155552671"
            class="w-full rounded-lg border p-2.5 outline-none transition-all focus:ring-2"
            :class="
              phoneError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            "
          />
          <p v-if="phoneError" class="mt-1 text-xs font-medium text-rose-600">
            {{ phoneError }}
          </p>
        </div>

        <!-- Stage + Owner -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Stage
            </label>
            <select
              v-model="stageId"
              class="w-full rounded-lg border border-gray-300 p-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            >
              <option v-for="stage in stagesStore.stages" :key="stage.id" :value="stage.id">
                {{ stage.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Owner
            </label>
            <select
              v-model="userId"
              class="w-full rounded-lg border border-gray-300 p-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            >
              <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
                {{ user.name || user.email }}
              </option>
            </select>
          </div>
        </div>

        <!-- Sequence -->
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Sequence
          </label>
          <select
            v-model="sequenceId"
            class="w-full rounded-lg border border-gray-300 p-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">None</option>
            <option v-for="sequence in sequences" :key="sequence.id" :value="sequence.id">
              {{ sequence.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-8 flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          @click="$emit('close')"
        >
          Cancel
        </button>

        <button
          class="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
          @click="createLead"
        >
          Create Lead
        </button>
      </div>
    </div>
  </div>
</template>
