<script setup>
  import {
    Hash,
    ArrowRight,
    BookOpen,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    BarChart3,
    Lightbulb,
    XCircle,
    Briefcase,
    ShoppingBag,
    Truck,
    HeartPulse,
    Layers
  } from 'lucide-vue-next'

  definePageMeta({
    layout: 'marketing',
    middleware: 'marketing-layout'
  })

  const user = useUser()

  await bootstrapUser()

  const isLoggedIn = computed(() => Boolean(user.value))

  // Navigation for the sticky sidebar
  const stepsNav = [
    { title: 'The Reality Check', anchor: 'reality-check', icon: AlertCircle },
    { title: 'System Overview', anchor: 'overview', icon: Layers },
    { title: 'Industry Scenarios', anchor: 'example', icon: BookOpen },
    { title: 'Step 1: Problem', anchor: 'step-1', icon: Lightbulb },
    { title: 'Step 2: Urgency', anchor: 'step-2', icon: ShieldCheck },
    { title: 'Step 3: Money', anchor: 'step-3', icon: Hash },
    { title: 'Step 4: Customer', anchor: 'step-4', icon: MessageSquare },
    { title: 'Step 5: Edge', anchor: 'step-5', icon: BarChart3 },
    { title: 'Step 6: Reality', anchor: 'step-6', icon: CheckCircle2 },
    { title: 'Why Ideas Fail', anchor: 'failure', icon: XCircle }
  ]

  // Common failure reasons for the analysis section
  const failureReasons = [
    { t: 'Wrong focus', d: 'Validating features instead of the core problem.' },
    { t: 'Biased questions', d: 'Asking "Would you use this?" instead of looking for behavior.' },
    { t: 'Opinions over data', d: 'Listening to friends instead of target users.' },
    { t: 'No tracking', d: 'Insights lost in scattered notes.' }
  ]

  const finalSteps = [
    {
      anchor: 'step-1',
      number: '01',
      title: 'Problem',
      label: 'Demand check',
      bullets: [
        'Is this problem real or assumed?',
        'How often does it occur?',
        'Does it actually impact users?'
      ],
      insight: '💡 We verify if the problem truly exists'
    },
    {
      anchor: 'step-2',
      number: '02',
      title: 'Urgency',
      label: 'Behavior check',
      bullets: [
        'What triggers someone to act?',
        'Is there a time-sensitive moment?',
        'What happens if they delay?'
      ],
      insight: '⚡ We check if people take action — not just care'
    },
    {
      anchor: 'step-3',
      number: '03',
      title: 'Money',
      label: 'Monetization check',
      bullets: [
        'Have people paid for this before?',
        'Who controls the budget?',
        "What's the cost of current solutions?"
      ],
      insight: '💰 We validate real willingness to pay'
    },
    {
      anchor: 'step-4',
      number: '04',
      title: 'Customer',
      label: 'Market clarity',
      bullets: [
        'Is the ideal customer clearly defined?',
        'Do they share the same pain?',
        'Can you easily find them?'
      ],
      insight: '🎯 We make sure you know exactly who this is for'
    },
    {
      anchor: 'step-5',
      number: '05',
      title: 'Edge',
      label: 'Competitive advantage',
      bullets: [
        'Is there a clear differentiation?',
        'Do users complain about current options?',
        'How competitive is the market?'
      ],
      insight: '🔥 We identify how you can actually stand out'
    },
    {
      anchor: 'step-6',
      number: '06',
      title: 'Reality',
      label: 'Execution fit',
      bullets: [
        'Do you have the skills to build this?',
        'Can you reach customers effectively?',
        'Do you have time and resources?'
      ],
      insight: '🚀 We check if you can realistically pull this off'
    }
  ]

  // Hyper-realistic case studies for SEO and scannability
  const caseStudies = {
    saas: {
      name: 'B2B SaaS: LegalCompliance AI',
      description: 'Automated compliance audits for small law firms.',
      icon: Briefcase,
      steps: [
        {
          step: '01',
          process: 'Problem',
          detail:
            'The Idea: A tool that scans case files for GDPR/HIPAA compliance errors. Target: Solo practitioners and firms with < 5 lawyers.'
        },
        {
          step: '02',
          process: 'Urgency',
          detail:
            'Confidence: 3/10. Risks: Do they know they are non-compliant? Is the liability high enough to pay for a tool?'
        },
        {
          step: '03',
          process: 'Money',
          detail:
            'Assumption: Firms fear fines. Testable Question: "When was your last audit, and what did it cost in billable hours?"'
        },
        {
          step: '04',
          process: 'Customer',
          detail:
            "Signal: They aren't afraid of fines; they are afraid of losing malpractice insurance or failing a client audit."
        },
        {
          step: '05',
          process: 'Edge',
          detail:
            'Insight: Value is "insurance readiness." 7/10 would pay if it guaranteed a lower malpractice premium.'
        },
        {
          step: '06',
          process: 'Reality',
          detail:
            'Decision: Pivot to "Insurance-Ready Audit Tool." Partner with malpractice insurers for distribution.'
        }
      ]
    },
    ecommerce: {
      name: 'D2C: EcoClean Kits',
      description: 'Subscription-based plastic-free cleaning concentrates.',
      icon: ShoppingBag,
      steps: [
        {
          step: '01',
          process: 'Problem',
          detail:
            'The Idea: Glass spray bottles + dissolvable tablets. Target: Urban millennials prioritizing zero-waste living.'
        },
        {
          step: '02',
          process: 'Urgency',
          detail:
            'Confidence: 6/10. Risks: Is cleaning power good? Will they refill? Is $800/mo too high?'
        },
        {
          step: '03',
          process: 'Money',
          detail:
            'Assumption: Users hate plastic. Testable Question: "Which bottle would you replace first if a plastic-free version existed?"'
        },
        {
          step: '04',
          process: 'Customer',
          detail:
            'Signal: They hate the clutter of 10 bottles more than the plastic. They want one "universal" cleaner.'
        },
        {
          step: '05',
          process: 'Edge',
          detail:
            'Insight: Convenience > Eco-friendliness. Switch if it saves space under the sink.'
        },
        {
          step: '06',
          process: 'Reality',
          detail:
            'Decision: Rebrand as "The Minimalist Cleaning System." Focus on "One Bottle, Infinite Refills."'
        }
      ]
    },
    service: {
      name: 'Local Service: LuxeDetail',
      description: 'On-demand mobile car detailing for luxury vehicles.',
      icon: Truck,
      steps: [
        {
          step: '01',
          process: 'Problem',
          detail:
            'The Idea: App-based detailing at your office. Target: Executives in tech hubs driving cars worth $50L+.'
        },
        {
          step: '02',
          process: 'Urgency',
          detail:
            'Confidence: 5/10. Risks: Will security allow it? Do owners trust mobile units with expensive paint?'
        },
        {
          step: '03',
          process: 'Money',
          detail:
            'Assumption: They are too busy. Testable Question: "How do you currently clean your car, and what is the biggest friction?"'
        },
        {
          step: '04',
          process: 'Customer',
          detail:
            'Signal: They hate the waiting room experience and worry about "swirl marks" from cheap cleaners.'
        },
        {
          step: '05',
          process: 'Edge',
          detail:
            'Insight: Trust > Convenience. They want "expert" care, asking about specific chemicals and tools.'
        },
        {
          step: '06',
          process: 'Reality',
          detail:
            'Decision: Pivot to "Certified Paint Correction Specialists." Focus on "Museum-Quality Care at Your Door."'
        }
      ]
    },
    health: {
      name: 'HealthTech: SleepSync',
      description: 'AI-powered circadian rhythm optimization for night-shift workers.',
      icon: HeartPulse,
      steps: [
        {
          step: '01',
          process: 'Problem',
          detail:
            'The Idea: Wearable integration for shift schedule optimization. Target: Nurses, pilots, and security personnel.'
        },
        {
          step: '02',
          process: 'Urgency',
          detail:
            'Confidence: 4/10. Risks: Will they follow strict schedules? Can AI improve shift-lag better than caffeine?'
        },
        {
          step: '03',
          process: 'Money',
          detail:
            'Assumption: Workers want health optimization. Testable Question: "What would you sacrifice 30 mins of sleep for?"'
        },
        {
          step: '04',
          process: 'Customer',
          detail:
            'Signal: They care about "not feeling like a zombie" when they get home to their kids, not "optimization."'
        },
        {
          step: '05',
          process: 'Edge',
          detail:
            'Insight: Pain point is "family presence." Pay for anything that helps them stay awake for dinner.'
        },
        {
          step: '06',
          process: 'Reality',
          detail:
            'Decision: Pivot to "Family-First Recovery." Focus on the "Transition Hour" between work and home.'
        }
      ]
    }
  }
</script>

<template>
  <div
    class="min-h-screen font-sans text-app-text selection:bg-emerald-500/20 selection:text-emerald-500"
  >
    <main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:flex lg:gap-x-12">
      <!-- LEFT SIDEBAR: PERSUASION NAV -->
      <aside class="hidden lg:block lg:w-64 lg:shrink-0">
        <nav class="sticky top-24 space-y-8">
          <div>
            <p class="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              The Validation System
            </p>
            <ul class="space-y-1">
              <li v-for="step in stepsNav" :key="step.anchor">
                <a
                  :href="`#${step.anchor}`"
                  class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-app-muted transition-all duration-200 hover:bg-app-hover hover:text-app-text"
                >
                  <component
                    :is="step.icon"
                    class="h-4 w-4 text-app-muted transition-colors group-hover:text-emerald-500"
                  />
                  {{ step.title }}
                </a>
              </li>
            </ul>
          </div>

          <div
            v-if="!isLoggedIn"
            class="rounded-xl bg-app-panel p-4 text-app-text shadow-xl border border-app-border"
          >
            <p class="mb-3 text-base font-black leading-tight text-app-text">
              Start validating your idea
            </p>
            <ul class="mb-4 space-y-1.5 text-xs text-app-muted">
              <li>→ Turn assumptions into testable questions</li>
              <li>→ Interview target customers</li>
              <li>→ Get clear decisions</li>
            </ul>
            <NuxtLink
              to="signup-login"
              class="group flex w-full items-center justify-center gap-2 rounded-lg border-4 border-white bg-emerald-600 py-2.5 text-[11px] font-black uppercase tracking-wide text-app-text transition-colors hover:bg-emerald-500/10 active:scale-95"
            >
              Start Validating Free
              <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="flex-1 lg:max-w-3xl">
        <!-- 1. HERO: EDITORIAL STYLE -->
        <section id="introduction" class="mb-16 sm:mb-24 lg:mb-32">
          <h1
            class="mb-6 text-3xl font-black leading-[0.95] tracking-tighter text-app-text sm:mb-8 sm:text-5xl lg:text-7xl"
          >
            Stop building ideas that <span class="text-app-muted">don’t work.</span>
          </h1>
          <p class="max-w-2xl text-base leading-relaxed text-app-text sm:text-lg">
            Validate your idea with real user signals before you waste months building the wrong
            thing.
          </p>
        </section>

        <!-- 2. URGENCY BLOCK -->
        <section
          id="reality-check"
          class="mb-16 scroll-mt-24 rounded-3xl border border-amber-500/5 bg-amber-500/5 p-6 sm:mb-24 sm:p-8 lg:mb-32 lg:p-10"
        >
          <div class="flex gap-4 sm:gap-6">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10"
            >
              <AlertCircle class="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 class="mb-2 text-base font-black text-app-text sm:text-lg">The Reality Check</h3>
              <p class="text-sm leading-relaxed text-app-text sm:text-base">
                Most founders waste 3–6 months building something nobody wants. Not because they
                lack skill — but because they validate the wrong things. This system prevents that
                by forcing you to face the data early.
              </p>
            </div>
          </div>
        </section>

        <!-- 3. SYSTEM OVERVIEW: DATA GRID STYLE -->
        <section id="overview" class="mb-16 scroll-mt-24 sm:mb-24 lg:mb-32">
          <div class="mb-8 flex items-end justify-between sm:mb-10">
            <div>
              <text-app-muted class="text-2xl font-black tracking-tight text-app-text sm:text-4xl">
                System Overview
              </text-app-muted>
              <p class="mt-1 text-sm text-app-muted sm:text-base">
                The 6-step process from idea → evidence → decision.
              </p>
            </div>
            <div class="mx-8 mb-3 hidden h-px flex-1 bg-app-border sm:block"></div>
          </div>

          <div class="rounded-3xl border border-app-border ">
            <div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table class="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr class="border-b border-app-border bg-app-card">
                    <th
                      class="px-4 py-4 text-xs font-black uppercase tracking-widest text-app-muted md:px-8 md:py-5"
                    >
                      Step
                    </th>
                    <th
                      class="px-4 py-4 text-xs font-black uppercase tracking-widest text-app-muted md:px-8 md:py-5"
                    >
                      Process
                    </th>
                    <th
                      class="px-4 py-4 text-xs font-black uppercase tracking-widest text-app-muted md:px-8 md:py-5"
                    >
                      Outcome
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-app-border">
                  <tr
                    v-for="(step, idx) in [
                      'Problem',
                      'Urgency',
                      'Money',
                      'Customer',
                      'Edge',
                      'Reality'
                    ]"
                    :key="step"
                    class="group transition-colors hover:bg-app-hover"
                  >
                    <td
                      class="px-4 py-4 font-mono text-sm text-app-muted transition-colors group-hover:text-app-text md:px-8 md:py-5"
                    >
                      0{{ idx + 1 }}
                    </td>
                    <td class="px-4 py-4 text-sm font-black text-app-text md:px-8 md:py-5">
                      {{ step }}
                    </td>
                    <td class="px-4 py-4 md:px-8 md:py-5">
                      <span
                        class="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-500"
                      >
                        <CheckCircle2 class="h-3 w-3" />
                        {{
                          [
                            'Clear direction',
                            'Identify risks',
                            'Find blind spots',
                            'Real signals',
                            'Insights',
                            'Confident action'
                          ][idx]
                        }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 6. HYPER-DETAILED EXAMPLES: EDITORIAL STACK -->
        <section id="example" class="mb-16 scroll-mt-24 sm:mb-24 lg:mb-32">
          <div class="mb-10 sm:mb-16">
            <text-app-muted class="mb-4 text-2xl font-black tracking-tighter text-app-text sm:text-4xl">
              Industry Scenarios
            </text-app-muted>
            <p class="max-w-xl text-base text-app-text sm:text-lg">
              Real-world examples of the system in action. From B2B SaaS to Local Services.
            </p>
          </div>

          <div class="space-y-16 sm:space-y-24 lg:space-y-32">
            <div
              v-for="(study, key) in caseStudies"
              :key="key"
              :id="`example-${key}`"
              class="group scroll-mt-24"
            >
              <div class="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-5">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-panel text-app-text shadow-xl border border-app-border transition-transform duration-500 group-hover:scale-110"
                >
                  <component :is="study.icon" class="h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-xl font-black tracking-tight text-app-text sm:text-2xl">
                    {{ study.name }}
                  </h3>
                  <p class="text-sm text-app-muted sm:text-base">{{ study.description }}</p>
                </div>
              </div>

              <div
                class="overflow-hidden rounded-[2.5rem] border border-app-border text-app-text"
              >
                <div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  <table class="w-full min-w-[700px] border-collapse text-left">
                    <thead>
                      <tr class="border-b border-app-border bg-app-card">
                        <th
                          class="w-24 px-8 py-6 text-xs font-black uppercase tracking-widest text-app-muted"
                        >
                          Step
                        </th>
                        <th
                          class="w-44 px-8 py-6 text-xs font-black uppercase tracking-widest text-app-muted"
                        >
                          Process
                        </th>
                        <th
                          class="px-8 py-6 text-xs font-black uppercase tracking-widest text-app-muted"
                        >
                          Scenario Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-app-border">
                      <tr
                        v-for="item in study.steps"
                        :key="item.step"
                        class="hover:bg-app-hover/30 align-top transition-colors"
                      >
                        <td class="px-8 py-8 font-mono text-sm text-app-muted">{{ item.step }}</td>
                        <td class="px-8 py-8">
                          <p class="text-base font-bold leading-relaxed text-app-text">
                            {{ item.process }}
                          </p>
                        </td>
                        <td class="px-8 py-8">
                          <p class="text-base leading-relaxed text-app-text">{{ item.detail }}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. HOW IT WORKS: FINAL PRODUCT-LAYERED STEPS -->
        <section class="mb-16 sm:mb-24 lg:mb-32">
          <div class="mb-10 sm:mb-14">
            <text-app-muted class="text-2xl font-black tracking-tighter text-app-text sm:text-4xl">Steps</text-app-muted>
            <p class="mt-3 max-w-2xl text-base text-app-text sm:text-lg">
              A structured system to evaluate your idea before you build.
            </p>
          </div>

          <div class="space-y-8">
            <section
              v-for="step in finalSteps"
              :id="step.anchor"
              :key="step.anchor"
              class="scroll-mt-24 rounded-2xl border border-app-border p-5 text-app-text  sm:rounded-3xl sm:p-8"
            >
              <div class="mb-4">
                <p class="text-2xl font-black tracking-tight text-app-text">
                  {{ step.number }} - {{ step.title }}
                </p>
                <p
                  class="bg-app-card mt-3 inline-flex rounded px-2 py-0.5 text-sm font-semibold text-app-text"
                >
                  {{ step.label }}
                </p>
              </div>

              <ul class="space-y-2 text-base leading-relaxed text-app-text">
                <li v-for="item in step.bullets" :key="item">- {{ item }}</li>
              </ul>

              <p class="mt-5 text-sm font-bold text-emerald-600">{{ step.insight }}</p>
              <p v-if="step.subnote" class="mt-2 text-sm font-medium text-app-muted">
                {{ step.subnote }}
              </p>
              <p v-if="step.micro" class="mt-2 text-xs font-semibold tracking-wide text-app-muted">
                {{ step.micro }}
              </p>
            </section>
          </div>
        </section>

        <!-- 7. FAILURE ANALYSIS -->
        <section id="failure" class="mb-16 scroll-mt-24 sm:mb-24 lg:mb-32">
          <text-app-muted class="mb-8 text-2xl font-black tracking-tight text-app-text sm:mb-10 sm:text-4xl">
            Why Most Ideas Fail
          </text-app-muted>
          <ul class="space-y-6">
            <li v-for="reason in failureReasons" :key="reason.t">
              <div class="flex items-start gap-3">
                <XCircle class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <div>
                  <h4 class="text-lg font-black text-app-text">{{ reason.t }}</h4>
                  <p class="mt-1 text-base leading-relaxed text-app-text">{{ reason.d }}</p>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- 8. FINAL CTA -->
        <section
          v-if="!isLoggedIn"
          class="relative overflow-hidden rounded-xl bg-app-panel p-6 text-center text-app-text sm:p-12 lg:p-16"
        >
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"
          ></div>
          <div class="relative z-10">
            <text-app-muted class="mb-6 text-2xl font-black tracking-tighter sm:text-4xl lg:text-5xl">
              Stop guessing. <br class="sm:hidden" />Start validating.
            </text-app-muted>
            <p class="mx-auto mb-8 max-w-md text-base text-app-muted sm:mb-10 sm:text-lg">
              Join 1,000+ founders who use this system to build evidence-backed startups.
            </p>
            <NuxtLink
              to="signup-login"
              class="group inline-flex items-center gap-3 rounded-2xl border-4 border-white bg-emerald-600 px-6 py-3 text-base font-black text-app-text transition-colors hover:bg-emerald-500/10 active:scale-95 sm:px-10 sm:py-5 sm:text-lg"
            >
              Validate Your Idea Now
              <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>
            <p class="mt-6 text-xs font-black uppercase tracking-widest text-app-text/40">
              No credit card required • Instant access
            </p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
