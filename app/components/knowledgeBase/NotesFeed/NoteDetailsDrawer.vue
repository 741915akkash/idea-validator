<script setup>
  import { X, BookOpen, Calendar } from 'lucide-vue-next'

  defineProps({
    note: Object,
    isOpen: Boolean
  })

  const emit = defineEmits(['close'])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const normalizeSourceLabel = (source) =>
    String(source || '')
      .replaceAll('_', ' ')
      .trim()

  const primaryBadge = (note) => {
    if (!note) return ''
    if (note.checkpoint) return note.checkpoint
    if (note.source === 'interview') return 'Interview'
    if (note.source === 'lead_activity') return 'CRM'
    return ''
  }

  const secondaryBadge = (note) => {
    if (!note) return ''
    if (note.question_id) return `Question ${note.question_id}`
    if (note.source === 'interview') return 'Freeform'
    if (note.source === 'lead_activity') return 'Lead Activity'
    if (note.source === 'quick_capture' || note.source === 'question_note') return ''

    const sourceLabel = normalizeSourceLabel(note.source)
    if (!sourceLabel) return ''
    if (sourceLabel.toLowerCase() === primaryBadge(note).toLowerCase()) return ''
    return sourceLabel
  }
</script>

<template>
  <div
    class="flex max-h-[calc(100vh-8rem)] min-h-[700px] w-full flex-col overflow-hidden rounded-3xl border border-app-border bg-app-panel text-app-text"
  >
    <Transition
      mode="out-in"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <!-- NOTE -->
      <div v-if="note" :key="note.id" class="flex h-full flex-1 flex-col">
        <!-- HEADER -->
        <div class="border-b border-app-border px-7 py-6">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <!-- BADGES -->
              <div
                v-if="primaryBadge(note) || secondaryBadge(note)"
                class="mb-3 flex flex-wrap items-center gap-2"
              >
                <div
                  v-if="primaryBadge(note)"
                  class="bg-emerald-500/10/10 inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500"
                >
                  <BookOpen class="h-3 w-3" />
                  {{ primaryBadge(note) }}
                </div>

                <div
                  v-if="secondaryBadge(note)"
                  class="rounded-lg border border-app-border bg-app-card px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-app-muted"
                >
                  {{ secondaryBadge(note) }}
                </div>
              </div>

              <!-- TITLE -->
              <h2
                class="text-2xl font-bold leading-tight tracking-tight"
                :class="note?.title?.trim() ? 'text-app-text' : 'text-app-muted'"
              >
                {{ note?.title?.trim() || 'No title' }}
              </h2>

              <!-- META -->
              <div class="mt-4 flex items-center gap-4">
                <div class="flex items-center gap-1 text-sm text-app-muted">
                  <Calendar class="h-4 w-4" />
                  {{ note.created_at || note.date ? formatDate(note.created_at || note.date) : '' }}
                </div>
              </div>
            </div>

            <!-- CLOSE -->
            <button
              @click="emit('close')"
              class="rounded-xl p-2 text-app-muted transition-colors hover:bg-app-hover hover:text-app-text"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- CONTENT -->
        <div class="custom-scrollbar flex-1 overflow-y-auto px-7 py-7">
          <div class="mb-8">
            <div class="mb-4 flex items-center gap-2">
              <h3 class="text-[11px] font-black uppercase tracking-[0.18em] text-app-muted">
                Note
              </h3>

              <div class="h-px flex-1 bg-slate-100"></div>
            </div>

            <div class="rounded-2xl border border-app-border bg-app-card p-5">
              <p class="whitespace-pre-wrap leading-8 text-app-text">
                {{ note.content }}
              </p>
            </div>
          </div>

          <div v-if="Array.isArray(note?.tags) && note.tags.length" class="mb-2">
            <div class="mb-3 flex items-center gap-2">
              <h3 class="text-[11px] font-black uppercase tracking-[0.18em] text-app-muted">
                Tags
              </h3>
              <div class="h-px flex-1 bg-slate-100"></div>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in note.tags"
                :key="tag"
                class="inline-flex items-center rounded-full border border-app-border px-3 py-1 text-xs font-medium text-app-text"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div
        v-else
        key="empty"
        class="flex h-full flex-1 flex-col items-center justify-center px-10 text-center"
      >
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-app-card">
          <BookOpen class="h-7 w-7 text-app-muted" />
        </div>

        <h3 class="mb-2 text-lg font-semibold text-app-text">Select a note</h3>

        <p class="max-w-[240px] text-sm leading-6 text-app-muted">
          Open any note or search result to view its full details here.
        </p>
      </div>
    </Transition>
  </div>
</template>
