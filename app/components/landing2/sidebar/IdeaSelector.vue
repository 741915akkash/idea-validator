<script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import { MoreHorizontal } from 'lucide-vue-next'

  defineProps({
    isClientReady: {
      type: Boolean,
      default: false
    },
    activeIdea: {
      type: Object,
      default: null
    },
    activeRootIdeas: {
      type: Array,
      default: () => []
    },
    hasArchivedIdeas: {
      type: Boolean,
      default: false
    },
    showIdeaActionsMenu: {
      type: Boolean,
      default: false
    },
    isUnarchiving: {
      type: Boolean,
      default: false
    },
    isRenaming: {
      type: Boolean,
      default: false
    },
    isArchiving: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits([
    'switch-quiz',
    'toggle-idea-actions-menu',
    'open-archived-ideas',
    'unarchive-current-quiz',
    'rename-current-quiz',
    'archive-current-quiz',
    'close-idea-actions-menu'
  ])

  const ideaActionsRef = ref(null)

  function handleDocumentClick(event) {
    if (!ideaActionsRef.value?.contains(event.target)) {
      emit('close-idea-actions-menu')
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
  })
</script>

<template>
  <div v-if="isClientReady" class="mt-6">
    <label class="mb-2 block text-xs font-medium uppercase text-app-muted"> Idea </label>

    <div class="flex items-center gap-2">
      <select
        class="min-w-0 flex-1 rounded-md border border-app-border px-3 py-2 bg-app-card text-sm text-app-text focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-app-hover"
        :value="activeIdea?.archived_at ? '' : activeIdea?.id || ''"
        :disabled="!activeRootIdeas.length"
        @change="emit('switch-quiz', $event.target.value)"
      >
        <option v-if="!activeRootIdeas.length" value="" disabled>No active ideas</option>
        <option v-for="q in activeRootIdeas" :key="q.id" :value="q.id">
          {{ q.name || 'Untitled idea' }}
        </option>
      </select>

      <div ref="ideaActionsRef" class="relative shrink-0">
        <button
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-app-border text-app-text transition hover:bg-app-hover disabled:cursor-not-allowed disabled:bg-app-hover disabled:text-app-muted"
          :disabled="!activeIdea && !hasArchivedIdeas"
          aria-label="Idea actions"
          @click.stop="emit('toggle-idea-actions-menu')"
        >
          <MoreHorizontal class="h-4 w-4" />
        </button>

        <div
          v-if="showIdeaActionsMenu"
          class="absolute right-0 z-20 mt-2 w-40 rounded-md bg-app-panel border border-app-border py-1 text-app-text"
        >
          <div class="px-3 py-2 text-sm font-medium text-app-text">
            {{ activeIdea?.name || 'Untitled idea' }}
          </div>
          <div class="my-1 border-t border-app-border" />
          <button
            class="block w-full px-3 py-2 text-left text-sm text-app-text hover:bg-app-hover disabled:cursor-not-allowed disabled:text-app-muted"
            :disabled="!hasArchivedIdeas"
            @click="emit('open-archived-ideas')"
          >
            View archived
          </button>
          <button
            v-if="activeIdea && activeIdea.archived_at"
            class="block w-full px-3 py-2 text-left text-sm text-app-text hover:bg-app-hover disabled:cursor-not-allowed disabled:text-app-muted"
            :disabled="isUnarchiving"
            @click="emit('unarchive-current-quiz')"
          >
            {{ isUnarchiving ? 'Converting...' : 'Convert to active idea' }}
          </button>
          <button
            v-if="activeIdea && !activeIdea.archived_at"
            class="block w-full px-3 py-2 text-left text-sm text-app-text hover:bg-app-hover"
            @click="emit('rename-current-quiz')"
          >
            {{ isRenaming ? 'Saving...' : 'Rename' }}
          </button>
          <button
            v-if="activeIdea && !activeIdea.archived_at"
            class="block w-full px-3 py-2 text-left text-sm text-app-text hover:bg-app-hover"
            @click="emit('archive-current-quiz')"
          >
            {{ isArchiving ? 'Archiving...' : 'Archive' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
