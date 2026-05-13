<script setup>
  import {
    Plus,
    Edit2,
    Trash2,
    Layers,
    Phone,
    Mail,
    MessageSquare,
    ChevronRight,
    Info
  } from 'lucide-vue-next'
  import { ref } from 'vue'
  import { useSequencesStore } from '~/stores/sequences'
  import HelpDrawer from '~/components/help/HelpDrawer.vue'

  const sequencesStore = useSequencesStore()
  const emit = defineEmits(['edit'])
  const showHelpDrawer = ref(false)

  async function removeSequence(id) {
    try {
      await sequencesStore.deleteSequence(id)
    } catch {
      // no-op for now; rollback is handled in the store
    }
  }

  function getSequenceDuration(steps) {
    if (!steps || !steps.length) return 0
    return steps.reduce((total, step) => total + (Number(step.offset) || 0), 0)
  }

  function getCumulativeDay(steps, index) {
    let total = 0
    for (let i = 0; i <= index; i++) {
      total += Number(steps[i].offset) || 0
    }
    return total
  }
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-12">
    <header class="mb-8 flex items-center justify-between">
      <!-- LEFT -->
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <span>Sequences</span>
          <Info
            class="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-700"
            @click="showHelpDrawer = true"
          />
        </h1>
        <p class="mt-0.5 text-xs text-gray-500">Automate your outreach workflows</p>
      </div>

      <!-- RIGHT -->
      <div class="flex items-center gap-2">
        <!-- Back (your style) -->
        <button
          @click="$router.push('/crm/leads')"
          class="inline-flex items-center justify-center rounded-lg bg-[#E5E4E2] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#DAD8D4] active:scale-95"
        >
          Back To Leads
        </button>

        <!-- Primary CTA -->
        <button
          @click="$emit('edit', null)"
          class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-95"
        >
          <Plus class="h-4 w-4" />
          New Sequence
        </button>
      </div>
    </header>

    <div v-if="sequencesStore.sequences.length" class="space-y-4">
      <div
        v-for="seq in sequencesStore.sequences"
        :key="seq.id"
        @click="$emit('edit', seq)"
        class="group relative cursor-pointer rounded-3xl border border-gray-300 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5"
      >
        <div class="flex flex-col gap-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-400 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-500"
              >
                <Layers class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-black text-gray-900 transition-colors group-hover:text-emerald-600">
                  {{ seq.title }}
                </h3>
                <div
                  class="mt-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  <span>{{ seq.steps.length }} steps</span>
                  <span class="h-1 w-1 rounded-full bg-gray"></span>
                  <span>{{ getSequenceDuration(seq.steps) }} days total</span>
                </div>
              </div>
            </div>

            <div
              class="flex translate-x-2 items-center gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
            >
              <button
                @click.stop="$emit('edit', seq)"
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                title="Edit"
              >
                <Edit2 class="h-4 w-4" />
              </button>
              <button
                @click.stop="removeSequence(seq.id)"
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Mini Timeline Preview -->
          <div class="no-scrollbar flex items-center gap-1 overflow-x-auto py-2">
            <template v-for="(step, i) in seq.steps" :key="i">
              <div
                class="flex shrink-0 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 transition-colors group-hover:border-emerald-100 group-hover:bg-white"
              >
                <component
                  :is="step.type === 'call' ? Phone : step.type === 'email' ? Mail : MessageSquare"
                  :class="[
                    'h-3 w-3',
                    step.type === 'call'
                      ? 'text-blue-500'
                      : step.type === 'email'
                        ? 'text-orange-500'
                        : 'text-emerald-500'
                  ]"
                />
                <span class="text-[9px] font-bold text-gray-500"
                  >Day {{ getCumulativeDay(seq.steps, i) }}</span
                >
              </div>
              <div v-if="i < seq.steps.length - 1" class="h-px w-4 shrink-0 bg-gray"></div>
            </template>
          </div>

          <div class="flex items-center justify-between border-t border-gray-50 pt-4">
            <div class="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Used in
              <span class="text-gray-900">{{ Math.floor(Math.random() * 20) + 5 }} leads</span>
            </div>
            <div
              class="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100"
            >
              Edit Flow <ChevronRight class="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-[40px] border-2 border-dashed border-gray-100 bg-gray-50/50 py-24 text-center"
    >
      <div
        class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-200 shadow-sm"
      >
        <Layers class="h-8 w-8" />
      </div>
      <h3 class="text-sm font-black uppercase tracking-widest text-gray-900">No sequences yet</h3>
      <p class="mx-auto mt-2 max-w-xs text-xs text-gray-400">
        Create your first outreach workflow to automate your sales process
      </p>
      <button
        @click="$emit('edit', null)"
        class="mt-8 rounded-xl bg-emerald-600 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700"
      >
        Create First Sequence
      </button>
    </div>
    <HelpDrawer
      :open="showHelpDrawer"
      title="Sequences"
      subtitle="Build repeatable outreach workflows."
      what="Sequences define step-by-step actions like calls, emails, and follow-ups over time."
      why="A clear sequence improves consistency, reduces manual effort, and helps leads move through your pipeline."
      :workflow="[
        'Create a sequence and add ordered steps.',
        'Set timing offsets for each step.',
        'Apply the sequence to relevant leads and track progress.'
      ]"
      :tips="[
        'Keep steps short and outcome-focused.',
        'Use realistic delays between touches.',
        'Review performance and refine underperforming steps.'
      ]"
      :related="['CRM', 'Leads', 'Edit Sequence']"
      @close="showHelpDrawer = false"
    />
  </div>
</template>
