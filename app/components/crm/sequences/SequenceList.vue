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
  import { useHelpContent } from '~/composables/useHelpContent'

  const sequencesStore = useSequencesStore()
  const emit = defineEmits(['edit'])
  const showHelpDrawer = ref(false)
  const help = useHelpContent('sequence-list')

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

  function getLeadUsageCount(seq) {
    const key = String(seq?.id || seq?.title || '')
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0
    }
    return 5 + (hash % 20)
  }
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-12">
    <header class="mb-6 rounded-lg border border-app-border px-6 py-5 text-app-text">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- LEFT -->
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight text-app-text">
            <span>Sequences</span>

            <Info
              class="h-5 w-5 cursor-pointer text-app-muted transition hover:text-app-muted"
              @click="showHelpDrawer = true"
            />
          </h1>

          <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
        </div>

        <!-- RIGHT -->
        <div class="flex items-center gap-2">
          <!-- Back -->
          <button
            @click="$router.push('/crm/leads')"
            class="inline-flex items-center justify-center rounded-lg border border-app-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-card"
          >
            Back To Leads
          </button>

          <!-- Primary CTA -->
          <button
            @click="$emit('edit', null)"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus class="h-4 w-4" />
            New Sequence
          </button>
        </div>
      </div>
    </header>

    <div v-if="sequencesStore.sequences.length" class="space-y-4">
      <div
        v-for="seq in sequencesStore.sequences"
        :key="seq.id"
        @click="$emit('edit', seq)"
        class="group relative cursor-pointer rounded-3xl border border-app-border p-6 text-app-text transition-all hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5"
      >
        <div class="flex flex-col gap-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl border border-app-border text-app-muted text-app-text transition-colors group-hover:bg-emerald-500/10 group-hover:text-emerald-500"
              >
                <Layers class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-black text-app-text transition-colors group-hover:text-emerald-600">
                  {{ seq.title }}
                </h3>
                <div
                  class="mt-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-app-muted"
                >
                  <span>{{ seq.steps.length }} steps</span>
                  <span class="bg-gray h-1 w-1 rounded-full"></span>
                  <span>{{ getSequenceDuration(seq.steps) }} days total</span>
                </div>
              </div>
            </div>

            <div
              class="flex translate-x-2 items-center gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
            >
              <button
                @click.stop="$emit('edit', seq)"
                class="rounded-lg p-2 text-app-muted transition-colors hover:bg-app-panel hover:text-app-text"
                title="Edit"
              >
                <Edit2 class="h-4 w-4" />
              </button>
              <button
                @click.stop="removeSequence(seq.id)"
                class="rounded-lg p-2 text-app-muted transition-colors hover:bg-red-50 hover:text-red-600"
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
                class="flex shrink-0 items-center gap-2 rounded-xl border border-app-border bg-app-panel px-3 py-1.5 transition-colors group-hover:border-emerald-500/20 group-hover:text-app-text"
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
                <span class="text-[9px] font-bold text-app-muted"
                  >Day {{ getCumulativeDay(seq.steps, i) }}</span
                >
              </div>
              <div v-if="i < seq.steps.length - 1" class="bg-gray h-px w-4 shrink-0"></div>
            </template>
          </div>

          <div class="flex items-center justify-between border-t border-app-border pt-4">
            <!-- <div class="text-[9px] font-bold uppercase tracking-widest text-app-muted">
              Used in <span class="text-app-text">{{ getLeadUsageCount(seq) }} leads</span>
            </div> -->
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
      class="bg-app-panel/50 rounded-[40px] border-2 border-dashed border-app-border py-24 text-center"
    >
      <div
        class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-app-text text-gray-200 shadow-sm"
      >
        <Layers class="h-8 w-8" />
      </div>
      <h3 class="text-sm font-black uppercase tracking-widest text-app-text">No sequences yet</h3>
      <p class="mx-auto mt-2 max-w-xs text-xs text-app-muted">
        Create your first outreach workflow to automate your sales process
      </p>
      <button
        @click="$emit('edit', null)"
        class="mt-8 rounded-xl bg-emerald-600 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700"
      >
        Create First Sequence
      </button>
    </div>
    <HelpDrawer :open="showHelpDrawer" :content="help" @close="showHelpDrawer = false" />
  </div>
</template>
