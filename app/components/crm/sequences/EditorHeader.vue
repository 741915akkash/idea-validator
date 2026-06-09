<script setup>
  import { ref } from 'vue'
  import { ArrowLeft, Save, Info } from 'lucide-vue-next'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'
  import { useHelpContent } from '~/composables/useHelpContent'

  defineProps({
    isEdit: Boolean
  })

  defineEmits(['back', 'save'])
  const showHelpDrawer = ref(false)
  const help = useHelpContent('sequence-editor-header')
</script>

<template>
  <header class="mb-6 rounded-lg border border-app-border px-6 py-5 text-app-text">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <!-- LEFT -->
      <div class="flex items-start gap-4">
        <button
          @click="$emit('back')"
          class="rounded-lg border border-app-border p-2.5 text-app-muted text-app-text transition hover:bg-app-card hover:text-app-text"
        >
          <ArrowLeft class="h-5 w-5" />
        </button>

        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-app-text">
            <span>{{ isEdit ? 'Edit Sequence' : 'Create Sequence' }}</span>

            <Info
              class="h-5 w-5 cursor-pointer text-app-muted transition hover:text-app-muted"
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
  <HelpDrawer :open="showHelpDrawer" :content="help" @close="showHelpDrawer = false" />
</template>
