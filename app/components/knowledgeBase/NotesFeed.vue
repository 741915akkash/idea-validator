<script setup>
  import { BookOpen, MessageSquare, ExternalLink } from 'lucide-vue-next'

  defineProps({
    notes: Array
  })
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="note in notes"
      :key="note.id"
      class="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
    >
      <div class="mb-2 flex items-start justify-between">
        <h3 class="text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
          {{ note.title }}
        </h3>
        <span class="text-[10px] font-medium uppercase tracking-widest text-slate-400">{{
          note.date
        }}</span>
      </div>

      <div
        class="mb-4 inline-flex items-center gap-2 rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700"
      >
        <BookOpen class="h-3 w-3" />
        {{ note.checkpoint }}
      </div>

      <p
        class="mb-6 italic leading-relaxed text-slate-600 underline decoration-slate-200 underline-offset-4"
      >
        {{ note.content }}
      </p>

      <div class="mb-6 flex flex-wrap items-center gap-2">
        <span
          v-for="tag in note.tags.slice(0, 3)"
          :key="tag"
          class="cursor-pointer rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-tight text-slate-400 transition-all hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600"
        >
          #{{ tag }}
        </span>
        <span
          v-if="note.tags.length > 3"
          class="pl-1 text-[10px] font-bold uppercase tracking-widest text-slate-300"
        >
          +{{ note.tags.length - 3 }}
        </span>
      </div>

      <div class="flex items-center gap-4 border-t border-slate-100 pt-4">
        <button
          class="flex items-center gap-2 text-xs font-bold text-slate-400 transition-all hover:text-emerald-600"
        >
          <MessageSquare class="h-3.5 w-3.5" />
          Open Question
        </button>
        <button
          class="flex items-center gap-2 text-xs font-bold text-slate-400 transition-all hover:text-emerald-600"
        >
          <ExternalLink class="h-3.5 w-3.5" />
          Related Notes
        </button>
      </div>
    </div>
  </div>
</template>
