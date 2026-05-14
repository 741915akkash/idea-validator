<script setup>
  import { ref } from 'vue'
  import { ArrowLeft, Save, Info } from 'lucide-vue-next'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'

  defineProps({
    isEdit: Boolean
  })

  defineEmits(['back', 'save'])
  const showHelpDrawer = ref(false)
</script>

<template>
  <header class="mb-6 rounded-lg border border-slate-200 bg-white px-6 py-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <!-- LEFT -->
      <div class="flex items-start gap-4">
        <button
          @click="$emit('back')"
          class="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft class="h-5 w-5" />
        </button>

        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <span>{{ isEdit ? 'Edit Sequence' : 'Create Sequence' }}</span>

            <Info
              v-if="isEdit"
              class="h-5 w-5 cursor-pointer text-gray-400 transition hover:text-gray-700"
              @click="showHelpDrawer = true"
            />
          </h1>

          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
        </div>
      </div>

      <!-- RIGHT -->
      <button
        @click="$emit('save')"
        class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        <Save class="h-4 w-4" />
        Save Sequence
      </button>
    </div>
  </header>
  <HelpDrawer
    :open="showHelpDrawer"
    title="Edit Sequence"
    subtitle="Refine an existing outreach workflow."
    what="Edit Sequence lets you update step order, timing, and message channels for an existing workflow."
    why="Iterating on existing sequences helps improve response rates without rebuilding from scratch."
    :workflow="[
      'Review current sequence steps and timing.',
      'Adjust step content, channel, or delays.',
      'Save changes and apply the improved flow to active leads.'
    ]"
    :tips="[
      'Change one variable at a time when possible.',
      'Shorten long gaps if leads are going cold.',
      'Keep messaging consistent across adjacent steps.'
    ]"
    :related="[
      { label: 'Sequences', to: '/crm/sequences' },
      { label: 'CRM', to: '/crm' },
      { label: 'Leads', to: '/crm' }
    ]"
    @close="showHelpDrawer = false"
  />
</template>
