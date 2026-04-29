<script setup>
  import { useRouter } from 'vue-router'

  const props = defineProps({
    sequence: Object
  })

  const router = useRouter()

  function openSequence() {
    if (!props.sequence?.id) return
    router.push(`/crm/sequences/${props.sequence.id}`)
  }
</script>

<template>
  <div class="bg-white p-6">
    <!-- HEADER -->
    <h3
      class="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
    >
      🤖 SEQUENCE
    </h3>

    <!-- CARD -->
    <div
      v-if="sequence"
      @click="openSequence"
      class="group cursor-pointer rounded-xl border border-gray-200 bg-gray-50/30 p-4 transition-all hover:bg-gray-100"
    >
      <div class="flex items-start justify-between">
        <!-- LEFT -->
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Active Sequence
          </span>

          <span class="text-sm font-semibold text-gray-900">
            {{ sequence.name }}
          </span>

          <!-- state -->
          <span v-if="sequence.current_step" class="text-xs text-gray-500">
            Step {{ sequence.current_step }} of {{ sequence.total_steps }}
            <span v-if="sequence.next_in"> • {{ sequence.next_in }} </span>
          </span>
        </div>

        <!-- RIGHT -->
        <div
          class="mt-1 text-xs text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
        >
          →
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-else class="rounded-xl border border-dashed border-gray-200 bg-gray-50/30 p-4">
      <div class="flex flex-col gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          No sequence
        </span>

        <button
          class="self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-gray-600 shadow-sm transition-all hover:border-emerald-500 hover:text-emerald-600"
        >
          Add Sequence
        </button>
      </div>
    </div>
  </div>
</template>
