<script setup>
  import { Tag, Trash2, ChevronRight } from 'lucide-vue-next'
  import { useUsersStore } from '~/stores/users'
  import { useSourcesStore } from '~/stores/sources'
  import { useLeadsStore } from '~/stores/leads'
  import { onMounted, ref } from 'vue'
  import { onClickOutside } from '@vueuse/core'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'

  const props = defineProps({
    lead: { type: Object, required: true },
    editingField: String,
    editValue: [String, Number],
    showMeta: Boolean
  })

  const emit = defineEmits(['start-edit', 'save-edit', 'update-value', 'toggle-meta', 'close'])

  const usersStore = useUsersStore()
  const sourcesStore = useSourcesStore()
  const leadsStore = useLeadsStore()

  const ownerDropdownRef = ref(null)
  const sourceDropdownRef = ref(null)
  const showOwnerDropdown = ref(false)
  const showSourceDropdown = ref(false)
  const newSource = ref('')

  onClickOutside(ownerDropdownRef, () => {
    showOwnerDropdown.value = false
  })

  onClickOutside(sourceDropdownRef, () => {
    showSourceDropdown.value = false
  })

  onMounted(async () => {
    if (usersStore.users.length === 0) {
      try {
        const users = await crmGlobalFetch('/api/crm/users')
        usersStore.setUsers(users)
      } catch {
        usersStore.setUsers([])
      }
    }

    if (sourcesStore.sources.length === 0) {
      try {
        const sources = await crmGlobalFetch('/api/crm/sources')
        sourcesStore.setSources(sources)
      } catch {
        sourcesStore.setSources([])
      }
    }
  })

  async function updateOwner(user_id) {
    const nextUserId = user_id
    const previousLead = { ...props.lead }

    const nextOwner = usersStore.users.find((u) => u.id === nextUserId)

    // optimistic update
    leadsStore.updateLead({
      ...props.lead,
      user_id: nextUserId,
      owner_name: nextOwner?.name ?? null,
      owner_email: nextOwner?.email ?? null
    })

    showOwnerDropdown.value = false

    try {
      const updated = await crmQuizFetch('/api/crm/leads/update', {
        method: 'PATCH',
        body: {
          id: props.lead.id,
          field: 'user_id',
          value: nextUserId
        }
      })

      leadsStore.updateLead(updated)
    } catch {
      leadsStore.updateLead(previousLead)
    }
  }

  async function updateSource(source_id) {
    const previousLead = { ...props.lead }
    const selected = sourcesStore.sources.find((source) => source.id === source_id)

    leadsStore.updateLead({
      ...props.lead,
      source_id,
      source_name: selected?.name ?? null
    })

    showSourceDropdown.value = false

    try {
      const updated = await crmQuizFetch('/api/crm/leads/update', {
        method: 'PATCH',
        body: {
          id: props.lead.id,
          field: 'source_id',
          value: source_id
        }
      })

      leadsStore.updateLead(updated)
    } catch {
      leadsStore.updateLead(previousLead)
    }
  }

  async function addNewSource() {
    const name = newSource.value.trim()
    if (!name) return

    const created = await crmGlobalFetch('/api/crm/sources/create', {
      method: 'POST',
      body: { name }
    })

    sourcesStore.addSource(created)
    await updateSource(created.id)
    newSource.value = ''
  }

  function deleteLead() {
    if (confirm('Are you sure you want to delete this lead?')) {
      leadsStore.deleteLead(props.lead.id)
      emit('close')
    }
  }
</script>

<template>
  <div class="border-t border-gray-100 bg-gray-50/50 p-6">
    <!-- HEADER -->
    <button @click="$emit('toggle-meta')" class="group flex w-full items-center justify-between">
      <h3
        class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
      >
        <Tag class="h-3 w-3" /> Meta Information
      </h3>
      <ChevronRight
        :class="['h-4 w-4 text-gray-400 transition-transform', showMeta ? 'rotate-90' : '']"
      />
    </button>

    <div v-show="showMeta" class="mt-4 space-y-4">
      <!-- VALUE -->
      <div class="flex items-center">
        <span class="w-24 text-[11px] text-gray-400">Value</span>

        <div class="flex-1">
          <input
            v-if="editingField === 'value'"
            id="edit-value"
            type="number"
            :value="editValue"
            @input="$emit('update-value', Number($event.target.value))"
            @blur="$emit('save-edit')"
            @keyup.enter="$emit('save-edit')"
            class="w-full border-b border-emerald-500 text-sm font-bold outline-none"
          />

          <span
            v-else
            @click="$emit('start-edit', 'value', lead.value)"
            class="cursor-pointer rounded px-1 text-sm font-bold hover:bg-gray-50"
          >
            ${{ lead.value?.toLocaleString() || '0' }}
          </span>
        </div>
      </div>

      <!-- SOURCE -->
      <div ref="sourceDropdownRef" class="relative flex items-center">
        <span class="w-24 text-[11px] text-gray-400">Source</span>

        <div class="flex-1">
          <div
            @click="showSourceDropdown = !showSourceDropdown"
            class="cursor-pointer rounded px-1 py-1 text-sm hover:bg-gray-100"
          >
            {{
              sourcesStore.sources.find((source) => source.id === lead.source_id)?.name
                || lead.source_name
                || 'Select Source'
            }}
          </div>

          <div
            v-if="showSourceDropdown"
            class="absolute z-50 mt-1 w-56 rounded border bg-white shadow"
          >
            <button
              v-for="source in sourcesStore.sources"
              :key="source.id"
              @click="updateSource(source.id)"
              class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              {{ source.name }}
            </button>

            <div class="my-1 border-t"></div>

            <div class="p-2">
              <input
                v-model="newSource"
                placeholder="Add new source"
                class="w-full rounded border px-2 py-1 text-sm outline-none"
                @keyup.enter="addNewSource"
              />
              <button
                class="mt-2 w-full rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                @click="addNewSource"
              >
                + Add new source
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔥 OWNER (UPDATED) -->
      <div ref="ownerDropdownRef" class="relative flex items-center">
        <span class="w-24 text-[11px] text-gray-400">Owner</span>

        <div class="flex-1">
          <!-- current owner -->
          <div
            @click="showOwnerDropdown = !showOwnerDropdown"
            class="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-gray-100"
          >
            <div
              class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
            >
              {{ usersStore.users.find((u) => u.id === lead.user_id)?.name?.[0] || '?' }}
            </div>

            <span class="text-sm">
              {{ usersStore.users.find((u) => u.id === lead.user_id)?.name || 'Unassigned' }}
            </span>
          </div>

          <!-- dropdown -->
          <div
            v-if="showOwnerDropdown"
            class="absolute z-50 mt-1 w-40 rounded border bg-white shadow"
          >
            <button
              v-for="user in usersStore.users"
              :key="user.id"
              @click="updateOwner(user.id)"
              class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              {{ user.name || user.email }}
            </button>
          </div>
        </div>
      </div>

      <!-- DELETE -->
      <div class="flex justify-end border-t pt-2">
        <button
          @click="deleteLead"
          class="flex items-center gap-2 text-[10px] text-red-500 hover:text-red-600"
        >
          <Trash2 class="h-3 w-3" /> Delete Lead
        </button>
      </div>
    </div>
  </div>
</template>
