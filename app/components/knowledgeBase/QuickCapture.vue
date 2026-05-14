<script setup>
  import { ref, computed } from 'vue'
  import {
    CheckSquare,
    PenTool,
    Image as ImageIcon,
    Search,
    Tag as TagIcon,
    MessageSquare,
    Sparkles,
    Zap,
    Plus
  } from 'lucide-vue-next'

  const props = defineProps({
    standalone: {
      type: Boolean,
      default: true
    }
  })

  const emit = defineEmits(['close', 'save'])

  const isExpanded = ref(!props.standalone)
  const title = ref('')
  const content = ref('')
  const tagInput = ref('')
  const showSuggestions = ref(false)

  const existingTags = [
    'urgency',
    'pricing',
    'compliance',
    'b2b',
    'positioning',
    'leads',
    'feedback',
    'feature-request',
    'onboarding',
    'retention'
  ]

  const tagSuggestions = computed(() => {
    const input =
      tagInput.value
        .toLowerCase()
        .split(/[,\s]+/)
        .pop() || ''
    if (!input) return []
    return existingTags.filter((t) => t.includes(input) && !tagInput.value.includes(t))
  })

  const addTag = (tag) => {
    const parts = tagInput.value.split(/[,\s]+/)
    parts.pop()
    parts.push(tag)
    tagInput.value = parts.join(', ') + ', '
    showSuggestions.value = false
  }

  const normalizeTag = (tag) =>
    tag
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const extractTags = (text) => {
    const matches = text.match(/#[\w-]+/g)
    return matches ? matches.map((m) => normalizeTag(m.slice(1))) : []
  }

  const expand = () => {
    if (props.standalone) {
      isExpanded.value = true
    }
  }

  const close = () => {
    if (props.standalone) {
      isExpanded.value = false
    }
    title.value = ''
    content.value = ''
    tagInput.value = ''
    emit('close')
  }

  const save = () => {
    // Combine tags from field and extracted from body
    const fieldTags = tagInput.value
      .split(/[,\s]+/)
      .map(normalizeTag)
      .filter((t) => t.length > 0)
    const bodyTags = extractTags(content.value)
    const allTags = [...new Set([...fieldTags, ...bodyTags])]

    emit('save', {
      title: title.value,
      content: content.value,
      tags: allTags
    })
    close()
  }
</script>

<template>
  <div
    :class="[
      standalone
        ? 'custom-scrollbar flex h-full flex-col items-center overflow-y-auto bg-slate-50 p-12'
        : 'w-full'
    ]"
  >
    <!-- Quick Capture Input -->
    <div :class="[standalone ? 'w-full max-w-2xl transition-all duration-300' : 'w-full']">
      <div
        class="relative overflow-hidden rounded-2xl border bg-white shadow-sm"
        :class="[
          isExpanded
            ? 'border-emerald-500/30 shadow-xl ring-4 ring-emerald-500/5'
            : 'border-slate-200',
          !standalone ? 'border-none shadow-none ring-0' : ''
        ]"
      >
        <!-- Collapsed Bar -->
        <div
          v-if="!isExpanded"
          class="group flex cursor-text items-center gap-4 px-6 py-4"
          @click="expand"
        >
          <span class="flex-1 text-lg font-light text-slate-400"
            >Capture insight, quote, objection...</span
          >
          <div
            class="flex items-center gap-2 text-slate-300 transition-colors group-hover:text-emerald-500"
          >
            <Zap class="h-5 w-5" />
          </div>
        </div>

        <!-- Expanded Form -->
        <div v-else class="animate-in fade-in slide-in-from-top-2 flex flex-col duration-300">
          <!-- Title Section -->
          <div class="px-6 pb-2 pt-5">
            <input
              v-model="title"
              type="text"
              placeholder="Title (optional)"
              class="w-full bg-transparent text-xl font-bold text-slate-900 placeholder:text-slate-200 focus:outline-none"
            />
          </div>

          <!-- Note Body -->
          <div class="px-6 py-2">
            <textarea
              v-model="content"
              placeholder="Write note..."
              class="min-h-[120px] w-full resize-none bg-transparent text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 focus:outline-none"
              autofocus
            ></textarea>
          </div>

          <!-- Refinement Section -->
          <div class="border-t border-slate-100 bg-slate-50/50 px-6 py-6">
            <!-- Tags -->
            <div class="relative space-y-3">
              <label
                class="flex items-center gap-2 pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                <TagIcon class="h-3 w-3" />
                Tags (optional)
              </label>
              <input
                v-model="tagInput"
                type="text"
                @focus="showSuggestions = true"
                @blur="setTimeout(() => (showSuggestions = false), 200)"
                placeholder="urgency, pricing, b2b..."
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none"
              />

              <!-- Suggestions Dropdown -->
              <div
                v-if="showSuggestions && tagSuggestions.length > 0"
                class="animate-in fade-in slide-in-from-bottom-2 absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl duration-200"
              >
                <div class="border-b border-slate-50 bg-slate-50/50 p-2">
                  <span class="px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400"
                    >Suggestions</span
                  >
                </div>
                <div class="custom-scrollbar max-h-48 overflow-y-auto">
                  <button
                    v-for="tag in tagSuggestions"
                    :key="tag"
                    @click="addTag(tag)"
                    class="group flex w-full items-center justify-between px-4 py-2 text-left text-xs font-bold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>#{{ tag }}</span>
                    <Plus
                      class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end border-t border-slate-100 px-6 py-4">
            <div class="flex items-center gap-3">
              <button
                @click="close"
                class="px-6 py-2 text-sm font-bold text-slate-400 transition-all hover:text-slate-600 focus:outline-none"
              >
                Cancel
              </button>
              <button
                @click="save"
                class="rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/5 transition-all hover:bg-emerald-600"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feed Mockup -->
    <div
      v-if="standalone"
      class="mt-12 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="group relative cursor-default overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-black/[0.02]"
      >
        <!-- Selection Highlight -->
        <div
          class="absolute inset-x-0 top-0 h-1 bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100"
        ></div>

        <div class="mb-3 flex items-center gap-2">
          <div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >Insight</span
          >
        </div>

        <h3 class="mb-2 font-bold leading-tight text-slate-900">
          Growth Experiments: Scalability Scoping
        </h3>
        <p class="mb-6 line-clamp-3 text-sm italic leading-relaxed text-slate-500">
          "...clients only care after audit warnings. We need to lead with compliance panic triggers
          rather than pure value prop." #urgency #compliance
        </p>

        <div class="flex flex-wrap gap-2 border-t border-slate-50 pt-4">
          <div
            v-for="tag in ['urgency', 'compliance', 'b2b']"
            :key="tag"
            class="cursor-pointer rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 transition-all hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600"
          >
            #{{ tag }}
          </div>
        </div>
      </div>
    </div>

    <!-- Background Elements Decor -->
    <div
      v-if="!isExpanded && standalone"
      class="pointer-events-none mt-20 flex select-none flex-col items-center opacity-20 grayscale"
    >
      <div class="mb-6 h-20 w-20 rounded-3xl bg-slate-200"></div>
      <div class="text-xs font-bold uppercase tracking-widest text-slate-400">
        Thought Collector
      </div>
    </div>
  </div>
</template>
