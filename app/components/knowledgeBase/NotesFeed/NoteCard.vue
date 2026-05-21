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
    class="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-emerald-200 hover:shadow-lg"
  >
    <!-- LEFT ACCENT -->
    <div class="absolute left-0 top-0 h-full w-1 bg-emerald-500/80"></div>

    <div class="p-5">
      <!-- TOP -->
      <div class="mb-3 flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="mb-2 flex items-center gap-2">
            <div
              class="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"
            >
              <BookOpen class="h-3 w-3" />
              {{ note.checkpoint }}
            </div>
          </div>

          <h3
            class="line-clamp-1 text-lg font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700"
          >
            {{ note.title }}
          </h3>
        </div>

        <div class="shrink-0">
          <p class="text-[11px] font-medium text-slate-400">
            {{ formatDate(note.created_at) }}
          </p>
        </div>
      </div>

      <!-- CONTENT -->
      <p class="line-clamp-3 leading-7 text-slate-600">
        {{ note.content }}
      </p>


    </div>
  </div>
</template>
