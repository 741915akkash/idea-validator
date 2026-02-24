<template>
  <section class="py-20 bg-slate-50 px-6">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-extrabold mb-8 text-center text-slate-900">The Real Problem</h2>
      <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <p class="text-xl font-semibold mb-6 text-slate-800">
          Founders Don't Fail From Lack of Effort. <br />
          <span class="text-emerald-600 underline decoration-emerald-200 underline-offset-4">They fail because they validate the wrong things.</span>
        </p>
        <ul class="space-y-4">
          <li v-for="(item, i) in problems" :key="i" class="flex items-start gap-3">
            <XCircle class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{{ item }}</span>
          </li>
        </ul>
        <p class="mt-8 pt-8 border-t border-slate-100 text-slate-700 font-medium italic text-center">
          "Most first-time founders don't need more motivation. They need a clear way to think."
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { XCircle } from 'lucide-vue-next'

const problems = [
  "They Build before confirming demand",
  "They Add features without proof",
  "They Chase feedback without structure",
  "They Pivot without clarity",
  "They Overthink instead of testing"
]
</script>
