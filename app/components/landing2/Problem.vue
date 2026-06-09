<template>
  <section id="problem-section" class="border-y border-app-border bg-app-card px-6 py-20">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-8 text-center text-3xl font-extrabold tracking-tight text-app-text sm:text-4xl">
        The Real Problem
      </h2>

      <div class="rounded-2xl border border-app-border p-8 text-app-text shadow-sm">
        <p class="mb-6 text-xl font-semibold leading-relaxed text-app-text sm:text-2xl">
          Founders Don't Fail From Lack of Effort.
          <br />
          <span class="text-red-600 underline decoration-red-200 underline-offset-4">
            They fail because they validate the wrong things.
          </span>
        </p>

        <ul class="space-y-4">
          <li v-for="(item, i) in problems" :key="i" class="flex items-start gap-3">
            <XCircle class="mt-1 h-5 w-5 shrink-0 text-red-500" />

            <span class="text-base font-medium text-app-text sm:text-lg">
              {{ item }}
            </span>
          </li>
        </ul>

        <p
          class="mt-8 border-t border-app-border pt-8 text-center text-base font-semibold italic text-app-muted"
        >
          "Most first-time founders don't need more motivation. They need a clear way to think."
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { XCircle } from 'lucide-vue-next'

  const problems = [
    'Build before confirming demand',
    'Add features without proof',
    'Chase feedback without structure',
    'Pivot without clarity',
    'Overthink instead of testing'
  ]
</script>
