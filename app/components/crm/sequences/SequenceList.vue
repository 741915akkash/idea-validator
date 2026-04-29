<script setup>
  import {
    Plus,
    Edit2,
    Trash2,
    Layers,
    Phone,
    Mail,
    MessageSquare,
    ChevronRight
  } from 'lucide-vue-next'
  import { useSequencesStore } from '~/stores/sequences'

  const sequencesStore = useSequencesStore()
  const emit = defineEmits(['edit'])

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
    <header class="mb-10 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-gray-900">Sequences</h1>
        <p class="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
          Automate your outreach workflows
        </p>
      </div>
      <button
        @click="$emit('edit', null)"
        class="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-gray-900/10 transition-all hover:bg-gray-800 active:scale-95"
      >
        <Plus class="h-4 w-4" /> New Sequence
      </button>
    </header>

    <div v-if="sequencesStore.sequences.length" class="space-y-4">
      <div
        v-for="seq in sequencesStore.sequences"
        :key="seq.id"
        @click="$emit('edit', seq)"
        class="group relative cursor-pointer rounded-3xl border border-gray-100 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5"
      >
        <div class="flex flex-col gap-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-500"
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
                  <span class="h-1 w-1 rounded-full bg-gray-200"></span>
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
              <div v-if="i < seq.steps.length - 1" class="h-px w-4 shrink-0 bg-gray-100"></div>
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
        class="mt-8 rounded-xl bg-gray-900 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-gray-900/10 transition-all hover:bg-gray-800"
      >
        Create First Sequence
      </button>
    </div>
  </div>
</template>
