<script setup>
  import { ref } from 'vue'
  import { useLeadsStore } from '~/stores/leads'
  import { useStagesStore } from '~/stores/stages'
  import { crmGlobalFetch, crmQuizFetch } from '~/composables/useCrmRequest'

  const props = defineProps({
    stage: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['close'])

  const stagesStore = useStagesStore()
  const leadsStore = useLeadsStore()

  const COLOR_OPTIONS = [
    { value: '#64748b', label: 'Slate', swatch: '⚫' },
    { value: '#f59e0b', label: 'Amber', swatch: '🟡' },
    { value: '#10b981', label: 'Emerald', swatch: '🟢' },
    { value: '#6366f1', label: 'Indigo', swatch: '🔵' },
    { value: '#ef4444', label: 'Red', swatch: '🔴' }
  ]

  function normalizeColor(value) {
    if (typeof value !== 'string') return '#10b981'
    const trimmed = value.trim()
    return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : '#10b981'
  }

  const name = ref(props.stage.name || '')
  const color = ref(normalizeColor(props.stage.color))
  const isSaving = ref(false)
  const saveError = ref('')

  async function saveStage() {
    const trimmedName = String(name.value || '').trim()
    if (!trimmedName) {
      saveError.value = 'Please enter a stage name.'
      return
    }

    isSaving.value = true
    saveError.value = ''

    try {
      const updated = await crmGlobalFetch('/api/crm/pipeline/update', {
        method: 'PATCH',
        body: {
          id: props.stage.id,
          name: trimmedName,
          color: color.value
        }
      })

      stagesStore.updateStage(updated)
      leadsStore.setLeads(
        leadsStore.leads.map((lead) =>
          lead.stage_id === updated.id ? { ...lead, stage: updated.name } : lead
        )
      )

      emit('close')
    } catch (error) {
      saveError.value =
        error?.data?.statusMessage ||
        error?.statusMessage ||
        'Could not save stage. Please try again.'
    } finally {
      isSaving.value = false
    }
  }
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click="$emit('close')"
  >
    <div class="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl" @click.stop>
      <h2 class="mb-6 text-xl font-bold text-gray-900">Edit Stage</h2>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Name
          </label>
          <input
            v-model="name"
            placeholder="Qualified"
            class="w-full rounded-lg border border-gray-300 p-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Color
          </label>
          <select
            v-model="color"
            class="w-full rounded-lg border border-gray-300 p-2.5 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            <option v-for="option in COLOR_OPTIONS" :key="option.value" :value="option.value">
              {{ option.swatch }} {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="saveError" class="mt-3 text-xs text-red-600">{{ saveError }}</p>

      <div class="mt-8 flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          @click="$emit('close')"
        >
          Cancel
        </button>

        <button
          class="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
          @click="saveStage"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
