<script setup>
  defineProps({
    showArchiveConfirmModal: {
      type: Boolean,
      default: false
    },
    showRenameModal: {
      type: Boolean,
      default: false
    },
    showArchivedIdeasModal: {
      type: Boolean,
      default: false
    },
    archiveIdeaName: {
      type: String,
      default: ''
    },
    isArchiving: {
      type: Boolean,
      default: false
    },
    isRenaming: {
      type: Boolean,
      default: false
    },
    renameDraft: {
      type: String,
      default: ''
    },
    archivedRootIdeas: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits([
    'close-archive-confirm',
    'confirm-archive',
    'close-rename',
    'save-rename',
    'update:renameDraft',
    'close-archived-ideas',
    'select-archived-idea'
  ])
</script>

<template>
  <div
    v-if="showArchiveConfirmModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @keydown.esc.prevent.stop="emit('close-archive-confirm')"
  >
    <button
      class="absolute inset-0 bg-slate-900/50"
      aria-label="Close archive dialog"
      @click="emit('close-archive-confirm')"
    />

    <div class="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-900">Archive Idea</h2>
      <div class="my-3 border-t border-slate-200" />

      <p class="text-sm text-slate-700">
        Archive "{{ archiveIdeaName || 'Untitled idea' }}"? It will move to archived ideas.
      </p>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button
          class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          :disabled="isArchiving"
          @click="emit('close-archive-confirm')"
        >
          Cancel
        </button>
        <button
          class="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isArchiving"
          @click="emit('confirm-archive')"
        >
          {{ isArchiving ? 'Archiving...' : 'Archive' }}
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="showRenameModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @keydown.esc.prevent.stop="emit('close-rename')"
  >
    <button
      class="absolute inset-0 bg-slate-900/50"
      aria-label="Close rename dialog"
      @click="emit('close-rename')"
    />

    <div class="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-900">Rename Idea</h2>
      <div class="my-3 border-t border-slate-200" />

      <input
        :value="renameDraft"
        class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        autofocus
        @input="emit('update:renameDraft', $event.target.value)"
        @keydown.enter.prevent="emit('save-rename')"
        @keydown.esc.prevent.stop="emit('close-rename')"
      />

      <div class="mt-4 flex items-center justify-end gap-2">
        <button
          class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          :disabled="isRenaming"
          @click="emit('close-rename')"
        >
          Cancel
        </button>
        <button
          class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!renameDraft.trim() || isRenaming"
          @click="emit('save-rename')"
        >
          {{ isRenaming ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="showArchivedIdeasModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @keydown.esc.prevent.stop="emit('close-archived-ideas')"
  >
    <button
      class="absolute inset-0 bg-slate-900/50"
      aria-label="Close archived ideas dialog"
      @click="emit('close-archived-ideas')"
    />

    <div class="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-900">Archived Ideas</h2>
      <div class="my-3 border-t border-slate-200" />

      <div v-if="!archivedRootIdeas.length" class="text-sm text-slate-500">
        No archived ideas.
      </div>

      <div v-else class="max-h-72 space-y-2 overflow-y-auto">
        <button
          v-for="q in archivedRootIdeas"
          :key="q.id"
          class="block w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          @click="emit('select-archived-idea', q.id)"
        >
          {{ q.name || 'Untitled idea' }}
        </button>
      </div>

      <div class="mt-4 flex items-center justify-end">
        <button
          class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          @click="emit('close-archived-ideas')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
