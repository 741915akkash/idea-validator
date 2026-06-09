<template>
  <section id="features-section" class="px-6 py-20 text-app-text">
    <div class="mx-auto max-w-5xl">
      <h2
        class="mb-10 text-center text-3xl font-extrabold leading-tight tracking-tight text-app-text sm:text-4xl"
      >
        Everything You Need To Learn Faster
      </h2>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(item, i) in features"
          :key="i"
          class="group flex flex-col rounded-2xl border border-app-border bg-app-card p-6 transition-all duration-300 hover:border-emerald-200 hover:text-app-text hover:shadow-md"
        >
          <div
            class="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-100"
          >
            <component :is="item.icon" class="h-6 w-6 text-emerald-600" />
          </div>
          <h3 class="mb-2.5 text-xl font-extrabold text-app-text">{{ item.title }}</h3>
          <p class="text-base font-medium leading-relaxed text-app-muted">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { Target, Users, FileText, UserCheck, HelpCircle, TrendingUp } from 'lucide-vue-next'

  const features = [
    {
      icon: Target,
      title: 'Validate Ideas',
      description: 'Turn assumptions into questions worth testing.'
    },
    {
      icon: Users,
      title: 'Interview Customers',
      description: 'Run structured conversations and uncover patterns.'
    },
    {
      icon: FileText,
      title: 'Capture Insights',
      description: 'Store notes, evidence, and learnings in one place.'
    },
    {
      icon: UserCheck,
      title: 'Manage Relationships',
      description: 'Track prospects, outreach, and follow-ups.'
    },
    {
      icon: HelpCircle,
      title: 'Resolve Uncertainty',
      description: 'Break unknowns into testable conditions and validation tasks.'
    },
    {
      icon: TrendingUp,
      title: 'Make Better Decisions',
      description: 'Use evidence from customers instead of opinions and assumptions.'
    }
  ]
</script>
