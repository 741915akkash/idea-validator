<script setup>
  import { X, BookOpen, Calendar, MessageSquare, Sparkles } from 'lucide-vue-next'

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
</script>

<template>
  <div
    class="flex max-h-[calc(100vh-8rem)] min-h-[700px] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white"
  >
    <!-- CONTENT TRANSITION -->
    <Transition
      mode="out-in"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <!-- NOTE CONTENT -->
      <div v-if="note" :key="note.id" class="flex h-full flex-1 flex-col">
        <!-- HEADER -->
        <div class="border-b border-slate-100 px-7 py-6">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <!-- BADGES -->
              <div class="mb-3 flex flex-wrap items-center gap-2">
                <div
                  class="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"
                >
                  <BookOpen class="h-3 w-3" />
                  {{ note?.checkpoint }}
                </div>

                <div
                  class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                >
                  Question {{ note?.question_id }}
                </div>
              </div>

              <!-- TITLE -->
              <h2 class="text-2xl font-bold leading-tight tracking-tight text-slate-900">
                {{ note?.title }}
              </h2>

              <!-- META -->
              <div class="mt-4 flex items-center gap-4">
                <div class="flex items-center gap-1 text-sm text-slate-400">
                  <Calendar class="h-4 w-4" />
                  {{ note?.date ? formatDate(note.date) : '' }}
                </div>
              </div>
            </div>

            <!-- CLOSE -->
            <button
              @click="emit('close')"
              class="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- CONTENT -->
        <div class="custom-scrollbar flex-1 overflow-y-auto px-7 py-7">
          <!-- NOTE -->
          <div class="mb-8">
            <div class="mb-4 flex items-center gap-2">
              <h3 class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Note
              </h3>

              <div class="h-px flex-1 bg-slate-100"></div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p class="whitespace-pre-wrap leading-8 text-slate-700">
                {{ note?.content }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div
        v-else
        key="empty"
        class="flex h-full flex-1 flex-col items-center justify-center px-10 text-center"
      >
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <BookOpen class="h-7 w-7 text-slate-400" />
        </div>

        <h3 class="mb-2 text-lg font-semibold text-slate-700">Select a note</h3>

        <p class="max-w-[240px] text-sm leading-6 text-slate-400">
          Open any note or search result to view its full details here.
        </p>
      </div>
    </Transition>
  </div>
</template>
