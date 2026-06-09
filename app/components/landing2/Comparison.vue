<template>
  <section id="comparison-section" class="px-6 py-20 text-app-text">
    <div class="mx-auto max-w-3xl">
      <h2
        class="mb-12 text-center text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl"
      >
        Why Not Just Use ChatGPT?
      </h2>

      <div class="space-y-6">
        <!-- Standard AI -->
        <div class="rounded-2xl border border-app-border bg-app-card p-6 sm:p-8">
          <h3 class="mb-4 text-sm font-extrabold uppercase tracking-wider text-app-muted">
            Standard AI Tools
          </h3>

          <ul class="space-y-3 font-medium">
            <li
              v-for="(item, i) in standardAi"
              :key="i"
              class="flex items-center gap-3 text-sm text-app-text sm:text-base md:text-lg"
            >
              <XCircle class="h-5 w-5 shrink-0 text-app-muted" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Idea Validator -->
        <div
          class="relative rounded-3xl border-2 border-emerald-600 p-6 text-app-text shadow-xl shadow-emerald-50 sm:p-8"
        >
          <h3 class="mb-4 text-sm font-black uppercase tracking-wider text-emerald-600">
            Idea Validator
          </h3>

          <ul class="space-y-3.5 font-medium">
            <li
              v-for="(item, i) in ideaValidator"
              :key="i"
              class="flex items-center gap-3 text-base text-app-text sm:text-lg"
            >
              <CheckCircle2 class="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <p class="mt-8 text-center text-base font-bold text-app-text sm:text-lg">
        ChatGPT gives ideas. This helps you prove them.
      </p>
    </div>
  </section>
</template>

<script setup>
  import { XCircle, CheckCircle2 } from 'lucide-vue-next'

  const standardAi = [
    'Gives answers',
    "Doesn't force validation",
    'No structure across steps',
    'No memory of decisions'
  ]

  const ideaValidator = [
    'Forces you to test real assumptions',
    'Builds a structured validation flow',
    'Tracks decisions and learnings',
    'Turns thinking into evidence'
  ]
</script>
