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
  <header class="mb-10 flex items-center justify-between">
    <div class="flex items-center gap-5">
      <button
        @click="$emit('back')"
        class="rounded-2xl border border-gray-100 bg-white p-3 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-black tracking-tight text-gray-900">
          <span>{{ isEdit ? 'Edit Sequence' : 'Create Sequence' }}</span>
          <Info
            v-if="isEdit"
            class="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-700"
            @click="showHelpDrawer = true"
          />
        </h1>
        <p class="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Workflow builder
        </p>
      </div>
    </div>
    <button
      @click="$emit('save')"
      class="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-95"
    >
      <Save class="h-4 w-4" /> Save Sequence
    </button>
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
    :related="['Sequences', 'CRM', 'Leads']"
    @close="showHelpDrawer = false"
  />
</template>
