<template>
  <section class="bg-slate-900 px-6 py-20 text-white">
    <div class="mx-auto max-w-4xl">
      <h2 class="mb-12 text-center text-3xl font-extrabold">
        How It Grows With You: From Idea to Traction — Without Guesswork
      </h2>
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(item, i) in stages" :key="i" class="relative">
          <div class="mb-2 text-sm font-bold text-emerald-400">{{ item.stage }}</div>
          <h3 class="mb-2 text-xl font-bold">{{ item.title }}</h3>
          <p class="text-sm text-slate-400">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  const stages = [
    { stage: 'Stage 1', title: 'Idea Clarity', desc: 'Define the core problem and user.' },
    { stage: 'Stage 2', title: 'Pre-Build Validation', desc: 'Confirm demand before coding.' },
    { stage: 'Stage 3', title: 'Early Product', desc: 'Test core value with real users.' },
    { stage: 'Stage 4', title: 'Growth Decisions', desc: "Scale what's proven to work." }
  ]
</script>
