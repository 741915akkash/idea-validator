<template>
  <section
    id="stages-section"
    class="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 py-20"
  >
    <!-- Background glow -->
    <div
      class="pointer-events-none absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-emerald-100 blur-[120px]"
    />

    <div class="relative mx-auto max-w-4xl">
      <h2
        class="mb-12 text-center text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl"
      >
        How It Grows With You: From Idea to Traction — Without Guesswork
      </h2>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(item, i) in stages"
          :key="i"
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
        >
          <div class="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
            {{ item.stage }}
          </div>

          <h3 class="mb-2 text-xl font-semibold text-slate-900">
            {{ item.title }}
          </h3>

          <p class="text-sm leading-relaxed text-slate-600">
            {{ item.desc }}
          </p>
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
