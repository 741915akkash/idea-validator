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
    props.step.offset = value === 'custom' ? props.step.offset || 5 : Number(value)
  }
</script>

<template>
  <div :id="'step-' + index" class="group/step relative pl-10">
    <!-- Timeline Vertical Line -->
    <div
      v-if="index < totalSteps - 1"
      class="absolute bottom-0 left-[15px] top-10 w-px bg-gray-100"
    ></div>

    <!-- Step Indicator Dot -->
    <div
      class="absolute left-0 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-[10px] font-black text-gray-400 shadow-sm transition-all group-hover/step:border-emerald-500 group-hover/step:text-emerald-500"
    >
      {{ index + 1 }}
    </div>

    <div
      :class="[
        'group/card relative overflow-visible rounded-[20px] border bg-white p-3 shadow-sm transition-all hover:border-gray-200 hover:shadow-md',
        step.type === 'call'
          ? 'border-l-2 border-gray-100 border-l-blue-500'
          : step.type === 'email'
            ? 'border-l-2 border-gray-100 border-l-orange-500'
            : 'border-l-2 border-gray-100 border-l-emerald-500'
      ]"
    >
      <div class="flex flex-col gap-2">
        <!-- Top Row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- Day Label -->
            <div class="flex shrink-0 items-center rounded-lg bg-gray-900 px-2 py-1 shadow-sm">
              <span class="text-[10px] font-black uppercase leading-none tracking-widest text-white"
                >Day {{ cumulativeDay }}</span
              >
            </div>

            <!-- Type Dropdown -->
            <div class="relative">
              <select
                v-model="step.type"
                class="cursor-pointer appearance-none rounded-lg border border-transparent bg-gray-50 px-3 py-1 pr-7 text-[9px] font-black uppercase tracking-wider text-gray-500 transition-all hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              >
                <option value="call">📞 Call</option>
                <option value="email">📧 Email</option>
                <option value="note">📝 Note</option>
              </select>
              <ChevronDown
                class="pointer-events-none absolute right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-gray-400"
              />
            </div>

            <!-- Offset Dropdown -->
            <div class="relative">
              <select
                :value="[0, 1, 3, 7].includes(step.offset) ? step.offset : 'custom'"
                @change="(e) => setOffset(e.target.value)"
                class="cursor-pointer appearance-none rounded-lg border border-gray-100 bg-white px-3 py-1 pr-7 font-mono text-[9px] font-black uppercase tracking-wider text-gray-400 transition-all hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              >
                <option :value="0">Same day</option>
                <option :value="1">+1 day</option>
                <option :value="3">+3 days</option>
                <option :value="7">+7 days</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown
                class="pointer-events-none absolute right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-gray-300"
              />
            </div>

            <input
              v-if="![0, 1, 3, 7].includes(step.offset)"
              v-model.number="step.offset"
              type="number"
              class="w-10 rounded-lg border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-black text-emerald-600 outline-none focus:border-emerald-300"
            />
          </div>

          <!-- Quick Actions -->
          <div
            class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100"
          >
            <button
              @click="$emit('move', index, -1)"
              :disabled="index === 0"
              class="p-1 text-gray-300 transition-colors hover:text-gray-900 disabled:opacity-10"
            >
              <ChevronUp class="h-3.5 w-3.5" />
            </button>
            <button
              @click="$emit('move', index, 1)"
              :disabled="index === totalSteps - 1"
              class="p-1 text-gray-300 transition-colors hover:text-gray-900 disabled:opacity-10"
            >
              <ChevronDown class="h-3.5 w-3.5" />
            </button>
            <button
              @click="$emit('remove', index)"
              class="p-1 text-gray-300 transition-colors hover:text-red-500"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-0.5">
          <input
            v-model="step.title"
            class="w-full border-none bg-transparent p-0 text-sm font-bold text-gray-900 placeholder-gray-200 outline-none focus:ring-0"
            placeholder="Step Title (e.g. Discovery Call)"
          />
          <textarea
            v-model="step.description"
            class="min-h-[28px] w-full resize-none border-none bg-transparent p-0 text-[11px] leading-normal text-gray-500 placeholder-gray-200 outline-none focus:ring-0"
            placeholder="Add a brief instruction..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
