<script setup>
  import { BookOpen, MessageSquare, ExternalLink, MoreHorizontal } from 'lucide-vue-next'

  const props = defineProps({
    note: Object
  })

  const emit = defineEmits(['open'])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
</script>

<template>
  <div
    @click="emit('open', note)"
    class="group relative cursor-pointer overflow-hidden rounded-2xl border border-app-border bg-app-card text-app-text transition-all hover:border-emerald-500/30 hover:shadow-lg"
  >
    <!-- LEFT ACCENT -->
    <div class="bg-emerald-500/10/80 absolute left-0 top-0 h-full w-1"></div>

    <div class="p-5">
      <!-- TOP -->
      <div class="mb-3 flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="mb-2 flex items-center gap-2">
            <div
              class="bg-emerald-500/10/10 inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500"
            >
              <BookOpen class="h-3 w-3" />
              {{ note.checkpoint }}
            </div>
          </div>

          <h3
            class="line-clamp-1 text-lg font-semibold tracking-tight text-app-text transition-colors group-hover:text-emerald-500"
          >
            {{ note.title }}
          </h3>
        </div>

        <div class="shrink-0">
          <p class="text-[11px] font-medium text-app-muted">
            {{ formatDate(note.created_at) }}
          </p>
        </div>
      </div>

      <!-- CONTENT -->
      <p class="line-clamp-3 leading-7 text-app-muted">
        {{ note.content }}
      </p>
    </div>
  </div>
</template>
