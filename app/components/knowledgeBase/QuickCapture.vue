<script setup>
  import { ref, computed } from 'vue'
  import { Tag as TagIcon, Plus } from 'lucide-vue-next'

  const emit = defineEmits(['close', 'save'])

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

  const close = () => {
    title.value = ''
    content.value = ''
    tagInput.value = ''

    emit('close')
  }

  const save = () => {
    const fieldTags = tagInput.value
      .split(/[,\s]+/)
      .map(normalizeTag)
      .filter((t) => t.length > 0)

    const bodyTags = extractTags(content.value)

    emit('save', {
      title: title.value,
      content: content.value,
      tags: [...new Set([...fieldTags, ...bodyTags])]
    })

    close()
  }
</script>

<template>
  <div class="w-full">
    <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <!-- Title Section -->
      <div class="px-5 pb-1 pt-4">
        <input
          v-model="title"
          type="text"
          placeholder="Title (optional)"
          class="w-full bg-transparent text-base font-semibold text-slate-900 placeholder:text-slate-200 focus:outline-none"
        />
      </div>

      <!-- Note Body -->
      <div class="px-5 py-1">
        <textarea
          v-model="content"
          placeholder="Write note..."
          class="min-h-[240px] w-full resize-none bg-transparent text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 focus:outline-none"
          autofocus
        ></textarea>
      </div>

      <!-- Tags -->
      <div class="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
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
            class="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <div class="border-b border-slate-50 bg-slate-50/50 p-2">
              <span class="px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Suggestions
              </span>
            </div>

            <div class="max-h-48 overflow-y-auto">
              <button
                v-for="tag in tagSuggestions"
                :key="tag"
                @click="addTag(tag)"
                class="group flex w-full items-center justify-between px-4 py-2 text-left text-xs font-bold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              >
                <span>#{{ tag }}</span>

                <Plus class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end border-t border-slate-100 px-5 py-3">
        <div class="flex items-center gap-3">
          <button
            @click="close"
            class="px-6 py-2 text-sm font-bold text-slate-400 transition-all hover:text-slate-600 focus:outline-none"
          >
            Cancel
          </button>

          <button
            @click="save"
            class="rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-600"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
