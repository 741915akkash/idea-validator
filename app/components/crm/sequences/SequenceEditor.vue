<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Plus, Circle } from 'lucide-vue-next'
  import { useSequencesStore } from '~/stores/sequences'
  import EditorHeader from './EditorHeader.vue'
  import Timeline from './Timeline.vue'
  import StepCard from './StepCard.vue'

  const props = defineProps({
    sequence: { type: Object, default: null }
  })

  const emit = defineEmits(['back'])
  const sequencesStore = useSequencesStore()
  const isSaving = ref(false)

  const form = ref({
    id: null,
    title: '',
    steps: []
  })

  const cumulativeDays = computed(() => {
    let total = 0
    return form.value.steps.map((s) => {
      total += Number(s.offset) || 0
      return total
    })
  })

  const totalDuration = computed(() => {
    const days = cumulativeDays.value
    return days.length > 0 ? days[days.length - 1] : 0
  })

  function scrollToStep(index) {
    const el = document.getElementById(`step-${index}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  onMounted(() => {
    if (props.sequence) {
      form.value = JSON.parse(JSON.stringify(props.sequence))
    } else {
      form.value.title = 'New Outreach Sequence'
      addStep()
    }
  })

  function addStep() {
    form.value.steps.push({
      type: 'call',
      title: '',
      description: '',
      offset: 0
    })
  }

  function removeStep(index) {
    form.value.steps.splice(index, 1)
  }

  function moveStep(index, direction) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= form.value.steps.length) return

    const step = form.value.steps.splice(index, 1)[0]
    form.value.steps.splice(newIndex, 0, step)
  }

  async function save() {
    if (!form.value.title.trim()) return
    if (isSaving.value) return

    isSaving.value = true

    try {
      if (form.value.id) {
        await sequencesStore.updateSequence(form.value)
      } else {
        await sequencesStore.addSequence(form.value)
      }
      emit('back')
    } finally {
      isSaving.value = false
    }
  }

  const offsetOptions = [
    { label: 'Same day', value: 0 },
    { label: '+1 day', value: 1 },
    { label: '+3 days', value: 3 },
    { label: '+7 days', value: 7 },
    { label: 'Custom', value: 'custom' }
  ]
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-12">
    <EditorHeader :is-edit="!!form.id" @back="$emit('back')" @save="save" />

    <div class="space-y-6 pb-40">
      <!-- 1. Title Input (Top Priority) -->
      <div class="rounded-[32px] border border-app-border p-8 text-app-text shadow-sm">
        <label class="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-app-muted"
          >Sequence Title</label
        >
        <input
          v-model="form.title"
          class="w-full border-none p-0 text-3xl font-black tracking-tight text-app-text placeholder-gray-200 outline-none focus:ring-0"
          placeholder="e.g. Cold Lead Outreach"
        />
      </div>

      <!-- 2. Enhanced Flow Preview Summary -->
      <Timeline
        :steps="form.steps"
        :cumulative-days="cumulativeDays"
        @scroll-to-step="scrollToStep"
      />

      <!-- 3. Steps List -->
      <div class="space-y-6 pt-12">
        <div class="flex items-center justify-between px-2 pt-4">
          <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">
            Step Configuration
          </h2>
          <div
            class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-app-muted"
          >
            <span class="flex items-center gap-1.5"
              ><Circle class="h-2.5 w-2.5 fill-current text-blue-500" /> Call</span
            >
            <span class="flex items-center gap-1.5"
              ><Circle class="h-2.5 w-2.5 fill-current text-orange-500" /> Email</span
            >
            <span class="flex items-center gap-1.5"
              ><Circle class="h-2.5 w-2.5 fill-current text-emerald-500" /> Note</span
            >
          </div>
        </div>

        <StepCard
          v-for="(step, index) in form.steps"
          :key="index"
          :step="step"
          :index="index"
          :total-steps="form.steps.length"
          :cumulative-day="cumulativeDays[index]"
          @move="moveStep"
          @remove="removeStep"
        />

        <button
          @click="addStep"
          class="hover:bg-emerald-500/10/30 group mt-4 flex w-full flex-col items-center gap-3 rounded-[28px] border-2 border-dashed border-app-border py-6 text-app-muted transition-all hover:border-emerald-200 hover:text-emerald-600"
        >
          <div
            class="rounded-2xl border border-app-border p-3 text-app-text shadow-sm transition-transform group-hover:scale-110"
          >
            <Plus class="h-6 w-6" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em]">Add Workflow Step</span>
        </button>
      </div>
    </div>
  </div>
</template>
