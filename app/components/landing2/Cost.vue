<template>
  <section id="cost-section" class="border-y border-rose-100 bg-rose-50/70 px-6 py-20">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-8 text-center text-3xl font-extrabold tracking-tight text-rose-950 sm:text-4xl">
        The Cost of Guessing Is Measured in Months — and Money.
      </h2>

      <div class="grid gap-3">
        <div
          v-for="(item, i) in costs"
          :key="i"
          class="flex items-center gap-3 rounded-2xl border border-rose-100/40 bg-white p-4 shadow-sm sm:p-5"
        >
          <XCircle class="h-5 w-5 shrink-0 text-rose-500" />

          <span class="text-base font-medium leading-relaxed text-rose-900 sm:text-lg">
            {{ item }}
          </span>
        </div>
      </div>

      <p class="mt-10 text-center font-semibold text-rose-900">
        "Building without structure feels productive — until the numbers prove otherwise."
      </p>
    </div>
  </section>
</template>

<script setup>
  import { XCircle } from 'lucide-vue-next'

  const costs = [
    '3-6 months building features users never asked for',
    'Launching to 0 paying customers because demand was assumed',
    'Spending 200+ hours coding before testing willingness to pay',
    'Running $10k-$50k in ads without confirming real need',
    'Pivoting 2 or 3 times because original assumptions were unclear',
    'Losing momentum after one silent launch that could have been prevented'
  ]
</script>
