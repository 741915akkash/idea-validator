<script setup>
  import { Phone, Mail, MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-vue-next'

  const props = defineProps({
    step: Object,
    index: Number,
    totalSteps: Number,
    cumulativeDay: Number
  })

  const emit = defineEmits(['move', 'remove'])

  const setOffset = (value) => {
    if (value === 'custom') {
      props.step.offset = 5
    } else {
      props.step.offset = Number(value)
    }
  }
</script>

<template>
  <div :id="'step-' + index" class="group/step relative pl-14">
    <!-- Timeline Vertical Line -->
    <div
      v-if="index < totalSteps - 1"
      class="absolute bottom-0 left-[22px] top-14 w-px bg-app-panel"
    ></div>

    <!-- Step Indicator Dot -->
    <div
      class="absolute left-0 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-app-border text-xs font-black text-app-muted text-app-text shadow-sm transition-all group-hover/step:border-emerald-500 group-hover/step:text-emerald-500"
    >
      {{ index + 1 }}
    </div>

    <!-- CARD -->
    <div
      :class="[
        'group/card relative overflow-visible rounded-[32px] border-l-[3px] p-6 shadow-sm transition-all hover:shadow-md',
        step.type === 'call'
          ? 'border-blue-500/30 border-l-blue-500 text-app-text'
          : step.type === 'email'
            ? 'border-orange-500/30 border-l-orange-500 text-app-text'
            : 'border-emerald-200 border-l-emerald-500 text-app-text'
      ]"
    >
      <div class="flex flex-col gap-6">
        <!-- TOP ROW -->
        <div class="flex items-start justify-between gap-4">
          <!-- LEFT CONTROLS -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- DAY -->
            <div class="flex shrink-0 items-center rounded-xl bg-app-panel px-4 py-2 shadow-sm">
              <span class="text-[11px] font-black uppercase tracking-widest text-white">
                Day {{ cumulativeDay }}
              </span>
            </div>

            <!-- CONTROL GROUP -->
            <div
              class="flex items-center gap-2 rounded-2xl border border-app-border p-1.5 text-app-text shadow-sm"
            >
              <!-- TYPE -->
              <div class="relative">
                <select
                  v-model="step.type"
                  class="cursor-pointer appearance-none rounded-xl border border-transparent bg-app-panel px-4 py-2.5 pr-10 text-sm font-semibold text-app-muted transition-all hover:border-app-border hover:text-app-text focus:border-emerald-300 focus:text-app-text focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="call">📞 Call</option>
                  <option value="email">📧 Email</option>
                  <option value="note">📝 Note</option>
                </select>

                <ChevronDown
                  class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
                />
              </div>

              <!-- DELAY -->
              <template v-if="[0, 1, 3, 7].includes(step.offset)">
                <div class="relative">
                  <select
                    :value="step.offset"
                    @change="(e) => setOffset(e.target.value)"
                    class="cursor-pointer appearance-none rounded-xl border border-transparent bg-app-panel px-4 py-2.5 pr-10 text-sm font-semibold text-app-muted transition-all hover:border-app-border hover:text-app-text focus:border-emerald-300 focus:text-app-text focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option :value="0">Immediately</option>
                    <option :value="1">After 1 Day</option>
                    <option :value="3">After 3 Days</option>
                    <option :value="7">After 1 Week</option>
                    <option value="custom">Custom Delay...</option>
                  </select>

                  <ChevronDown
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
                  />
                </div>
              </template>

              <!-- CUSTOM DELAY -->
              <template v-else>
                <div
                  class="flex items-center gap-2 rounded-xl border border-app-border bg-app-panel px-3 py-2"
                >
                  <span class="text-sm font-semibold text-app-muted"> After </span>

                  <input
                    v-model.number="step.offset"
                    type="number"
                    min="0"
                    class="w-16 rounded-lg border border-app-border px-2 py-1 text-center text-sm font-bold text-app-text text-emerald-500 outline-none focus:border-emerald-300"
                  />

                  <span class="text-sm font-semibold text-app-muted"> Days </span>

                  <!-- BACK TO PRESETS -->
                  <button
                    @click="step.offset = 1"
                    class="ml-2 rounded-lg border border-app-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-app-muted text-app-text transition hover:bg-app-panel hover:text-app-muted"
                  >
                    Presets
                  </button>
                </div>
              </template>
            </div>
          </div>

          <!-- ACTIONS -->
          <div
            class="flex items-center gap-1 opacity-0 transition-opacity group-hover/card:opacity-100"
          >
            <button
              @click="$emit('move', index, -1)"
              :disabled="index === 0"
              class="rounded-xl p-2 text-app-muted transition-colors hover:text-app-text disabled:opacity-10"
            >
              <ChevronUp class="h-5 w-5" />
            </button>

            <button
              @click="$emit('move', index, 1)"
              :disabled="index === totalSteps - 1"
              class="rounded-xl p-2 text-app-muted transition-colors hover:text-app-text disabled:opacity-10"
            >
              <ChevronDown class="h-5 w-5" />
            </button>

            <button
              @click="$emit('remove', index)"
              class="hover:bg-red-500/100/5 rounded-xl p-2 text-app-muted transition-colors hover:text-red-500"
            >
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- CONTENT -->
        <div class="space-y-4">
          <!-- TITLE -->
          <input
            v-model="step.title"
            class="w-full border-none bg-transparent p-0 text-xl font-black tracking-tight text-app-text placeholder-gray-300 outline-none focus:ring-0"
            placeholder="Step Title (e.g. Discovery Call)"
          />

          <!-- DESCRIPTION -->
          <textarea
            v-model="step.description"
            class="bg-app-panel/70 min-h-[140px] w-full resize-none rounded-3xl border border-white/60 p-5 text-sm leading-relaxed text-app-muted placeholder-gray-400 outline-none transition-all focus:border-emerald-200 focus:text-app-text focus:ring-0"
            placeholder="Add detailed instructions, talking points, email copy, follow-up notes, or workflow guidance..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
