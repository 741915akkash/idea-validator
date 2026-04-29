<template>
  <section class="bg-slate-50 px-6 py-20">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-8 text-center text-3xl font-extrabold text-slate-900">The Real Problem</h2>
      <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p class="mb-6 text-xl font-semibold text-slate-800">
          Founders Don't Fail From Lack of Effort. <br />
          <span class="text-red-600 underline decoration-red-200 underline-offset-4"
            >They fail because they validate the wrong things.</span
          >
        </p>
        <ul class="space-y-4">
          <li v-for="(item, i) in problems" :key="i" class="flex items-start gap-3">
            <XCircle class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <span>{{ item }}</span>
          </li>
        </ul>
        <p
          class="mt-8 border-t border-slate-100 pt-8 text-center font-medium italic text-slate-700"
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
