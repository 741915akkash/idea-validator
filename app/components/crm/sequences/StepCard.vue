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
      class="absolute bottom-0 left-[22px] top-14 w-px bg-gray-200"
    ></div>

    <!-- Step Indicator Dot -->
    <div
      class="absolute left-0 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-black text-gray-400 shadow-sm transition-all group-hover/step:border-emerald-500 group-hover/step:text-emerald-500"
    >
      {{ index + 1 }}
    </div>

    <!-- CARD -->
    <div
      :class="[
        'group/card relative overflow-visible rounded-[32px] border-l-[3px] p-6 shadow-sm transition-all hover:shadow-md',
        step.type === 'call'
          ? 'border-blue-200 border-l-blue-500 bg-white'
          : step.type === 'email'
            ? 'border-orange-200 border-l-orange-500 bg-white'
            : 'border-emerald-200 border-l-emerald-500 bg-white'
      ]"
    >
      <div class="flex flex-col gap-6">
        <!-- TOP ROW -->
        <div class="flex items-start justify-between gap-4">
          <!-- LEFT CONTROLS -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- DAY -->
            <div class="flex shrink-0 items-center rounded-xl bg-gray-900 px-4 py-2 shadow-sm">
              <span class="text-[11px] font-black uppercase tracking-widest text-white">
                Day {{ cumulativeDay }}
              </span>
            </div>

            <!-- CONTROL GROUP -->
            <div
              class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm"
            >
              <!-- TYPE -->
              <div class="relative">
                <select
                  v-model="step.type"
                  class="cursor-pointer appearance-none rounded-xl border border-transparent bg-gray-50 px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 transition-all hover:border-gray-200 hover:bg-white focus:border-emerald-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="call">📞 Call</option>
                  <option value="email">📧 Email</option>
                  <option value="note">📝 Note</option>
                </select>

                <ChevronDown
                  class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
              </div>

              <!-- DELAY -->
              <template v-if="[0, 1, 3, 7].includes(step.offset)">
                <div class="relative">
                  <select
                    :value="step.offset"
                    @change="(e) => setOffset(e.target.value)"
                    class="cursor-pointer appearance-none rounded-xl border border-transparent bg-gray-50 px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 transition-all hover:border-gray-200 hover:bg-white focus:border-emerald-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option :value="0">Immediately</option>
                    <option :value="1">After 1 Day</option>
                    <option :value="3">After 3 Days</option>
                    <option :value="7">After 1 Week</option>
                    <option value="custom">Custom Delay...</option>
                  </select>

                  <ChevronDown
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </template>

              <!-- CUSTOM DELAY -->
              <template v-else>
                <div
                  class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <span class="text-sm font-semibold text-gray-700"> After </span>

                  <input
                    v-model.number="step.offset"
                    type="number"
                    min="0"
                    class="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm font-bold text-emerald-700 outline-none focus:border-emerald-300"
                  />

                  <span class="text-sm font-semibold text-gray-700"> Days </span>

                  <!-- BACK TO PRESETS -->
                  <button
                    @click="step.offset = 1"
                    class="ml-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
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
              class="rounded-xl p-2 text-gray-300 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-10"
            >
              <ChevronUp class="h-5 w-5" />
            </button>

            <button
              @click="$emit('move', index, 1)"
              :disabled="index === totalSteps - 1"
              class="rounded-xl p-2 text-gray-300 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-10"
            >
              <ChevronDown class="h-5 w-5" />
            </button>

            <button
              @click="$emit('remove', index)"
              class="rounded-xl p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
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
            class="w-full border-none bg-transparent p-0 text-xl font-black tracking-tight text-gray-900 placeholder-gray-300 outline-none focus:ring-0"
            placeholder="Step Title (e.g. Discovery Call)"
          />

          <!-- DESCRIPTION -->
          <textarea
            v-model="step.description"
            class="min-h-[140px] w-full resize-none rounded-3xl border border-white/60 bg-gray-100/70 p-5 text-sm leading-relaxed text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-emerald-200 focus:bg-white focus:ring-0"
            placeholder="Add detailed instructions, talking points, email copy, follow-up notes, or workflow guidance..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
