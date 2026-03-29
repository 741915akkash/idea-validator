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
    layout: 'marketing'
  })

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

  const stepDescriptions = [
    'Turn your idea into something specific and testable. If your idea is vague, your validation will be useless.',
    "Know exactly where you're guessing. Low confidence = high risk. Assess urgency across problem, audience, and pricing.",
    'Convert your idea into assumptions, uncertainties, and testable questions. Find the "leap of faith" assumptions.',
    'Ask clear, neutral, decision-focused questions. Avoid "Would you use this?" and focus on "What do you do today?"',
    'Spot patterns, avoid confirmation bias, and identify strong vs weak signals. Look for "surprising" answers.',
    "Proceed, pivot, change pricing, or drop the idea — based on evidence. Don't fall in love with your solution."
  ]

  const stepChecklists = [
    ['Target users', 'Problem clarity', 'Single use-case'],
    ['Problem Severity', 'Audience Access', 'Pricing Willingness']
  ]

  const stepQaBlocks = [
    [
      { q: 'What is the leap-of-faith assumption?', a: 'Users care enough to switch behavior.' },
      { q: 'What must be tested first?', a: 'The highest-uncertainty assumption.' }
    ],
    [
      { q: 'What should you ask?', a: 'Neutral, behavior-based questions.' },
      { q: 'What should you avoid?', a: 'Leading questions and opinion fishing.' }
    ]
  ]

  const stepSignalBadges = [
    [
      { label: 'Pattern Matching', score: 'High' },
      { label: 'Bias Detection', score: 'Medium' },
      { label: 'Signal Strength', score: 'High' }
    ],
    [
      { label: 'Evidence Review', score: 'High' },
      { label: 'Pivot Strategy', score: 'Medium' },
      { label: 'Next Milestone', score: 'High' }
    ]
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
            'Confidence: 6/10. Risks: Is cleaning power good? Will they refill? Is ₹800/mo too high?'
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
            'The Idea: App-based detailing at your office. Target: Executives in tech hubs driving cars worth ₹50L+.'
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
    class="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900"
  >
    <main class="mx-auto max-w-7xl px-6 py-12 lg:flex lg:gap-x-12">
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
                  class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
                >
                  <component
                    :is="step.icon"
                    class="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-500"
                  />
                  {{ step.title }}
                </a>
              </li>
            </ul>
          </div>

          <div class="rounded-xl bg-slate-900 p-4 text-white shadow-xl shadow-slate-200">
            <p class="mb-3 text-base font-black leading-tight text-white">
              Start validating your idea
            </p>
            <ul class="mb-4 space-y-1.5 text-xs text-slate-200">
              <li>→ Turn assumptions into testable questions</li>
              <li>→ Interview target customers</li>
              <li>→ Get clear decisions</li>
            </ul>
            <NuxtLink
              to="/recommendation"
              class="group flex w-full items-center justify-center gap-2 rounded-lg border-4 border-white bg-emerald-600 py-2.5 text-[11px] font-black uppercase tracking-wide text-white transition-colors hover:bg-emerald-500 active:scale-95"
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
        <section id="introduction" class="mb-20">
          <h1
            class="mb-8 text-5xl font-black leading-[0.95] tracking-tighter text-slate-900 lg:text-7xl"
          >
            Stop building ideas that <span class="text-slate-300">don’t work.</span>
          </h1>
          <p class="max-w-2xl text-xl leading-relaxed text-slate-700">
            Validate your idea with real user signals before you waste months building the wrong
            thing.
          </p>
        </section>

        <!-- 2. URGENCY BLOCK -->
        <section
          id="reality-check"
          class="mb-20 scroll-mt-24 rounded-3xl border border-amber-100 bg-amber-50 p-10"
        >
          <div class="flex gap-6">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100"
            >
              <AlertCircle class="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 class="mb-2 text-lg font-black text-slate-900">The Reality Check</h3>
              <p class="text-base leading-relaxed text-slate-700">
                Most founders waste 3–6 months building something nobody wants. Not because they
                lack skill — but because they validate the wrong things. This system prevents that
                by forcing you to face the data early.
              </p>
            </div>
          </div>
        </section>

        <!-- 3. SYSTEM OVERVIEW: DATA GRID STYLE -->
        <section id="overview" class="mb-32 scroll-mt-24">
          <div class="mb-10 flex items-end justify-between">
            <div>
              <h2 class="text-3xl font-black tracking-tight text-slate-900">System Overview</h2>
              <p class="mt-1 text-base text-slate-600">
                The 6-step process from idea → evidence → decision.
              </p>
            </div>
            <div class="mx-8 mb-3 hidden h-px flex-1 bg-slate-100 sm:block"></div>
          </div>

          <div class="rounded-3xl border border-slate-100 shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50">
                    <th
                      class="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 md:px-8 md:py-5"
                    >
                      Step
                    </th>
                    <th
                      class="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 md:px-8 md:py-5"
                    >
                      Process
                    </th>
                    <th
                      class="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 md:px-8 md:py-5"
                    >
                      Outcome
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(step, idx) in ['Problem', 'Urgency', 'Money', 'Customer', 'Edge', 'Reality']"
                    :key="step"
                    class="group transition-colors hover:bg-slate-50/50"
                  >
                    <td
                      class="px-4 py-4 font-mono text-sm text-slate-400 transition-colors group-hover:text-slate-900 md:px-8 md:py-5"
                    >
                      0{{ idx + 1 }}
                    </td>
                    <td class="px-4 py-4 text-sm font-black text-slate-900 md:px-8 md:py-5">
                      {{ step }}
                    </td>
                    <td class="px-4 py-4 md:px-8 md:py-5">
                      <span
                        class="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700"
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
        <section id="example" class="mb-40 scroll-mt-24">
          <div class="mb-16">
            <h2 class="mb-4 text-4xl font-black tracking-tighter text-slate-900">
              Industry Scenarios
            </h2>
            <p class="max-w-xl text-lg text-slate-700">
              Real-world examples of the system in action. From B2B SaaS to Local Services.
            </p>
          </div>

          <div class="space-y-32">
            <div
              v-for="(study, key) in caseStudies"
              :key="key"
              :id="`example-${key}`"
              class="group scroll-mt-24"
            >
              <div class="mb-10 flex items-center gap-5">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 transition-transform duration-500 group-hover:scale-110"
                >
                  <component :is="study.icon" class="h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-2xl font-black tracking-tight text-slate-900">
                    {{ study.name }}
                  </h3>
                  <p class="text-base text-slate-600">{{ study.description }}</p>
                </div>
              </div>

              <div
                class="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-100"
              >
                <div class="overflow-x-auto">
                  <table class="w-full min-w-[700px] border-collapse text-left">
                    <thead>
                      <tr class="border-b border-slate-100 bg-slate-50">
                        <th
                          class="w-24 px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500"
                        >
                          Step
                        </th>
                        <th
                          class="w-44 px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500"
                        >
                          Process
                        </th>
                        <th
                          class="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500"
                        >
                          Scenario Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                      <tr
                        v-for="item in study.steps"
                        :key="item.step"
                        class="align-top transition-colors hover:bg-slate-50/30"
                      >
                        <td class="px-8 py-8 font-mono text-sm text-slate-400">{{ item.step }}</td>
                        <td class="px-8 py-8">
                          <p class="text-base font-bold leading-relaxed text-slate-900">
                            {{ item.process }}
                          </p>
                        </td>
                        <td class="px-8 py-8">
                          <p class="text-base leading-relaxed text-slate-700">{{ item.detail }}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. THE STEPS: MINIMALIST CARDS -->
        <div class="mb-40 space-y-40">
          <section
            v-for="(step, idx) in stepsNav.slice(3, 9)"
            :key="step.anchor"
            :id="step.anchor"
            class="group scroll-mt-24 rounded-3xl p-6 md:p-8"
            :class="idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'"
          >
            <div
              class="flex flex-col items-start gap-16"
              :class="idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
            >
              <div class="flex-1">
                <div class="mb-8 flex items-center gap-6">
                  <span
                    class="text-6xl font-black text-slate-100 transition-colors duration-500 group-hover:text-emerald-50"
                    >0{{ idx + 1 }}</span
                  >
                  <h3 class="text-4xl font-black tracking-tighter text-slate-900">
                    {{ step.title.split(': ')[1] }}
                  </h3>
                </div>
                <p class="mb-10 text-lg leading-relaxed text-slate-700">
                  {{ stepDescriptions[idx] }}
                </p>
              </div>
              <div
                class="w-full shrink-0 rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all duration-500 group-hover:border-emerald-200 group-hover:bg-emerald-50/30 md:w-64"
              >
                <template v-if="idx < 2">
                  <p class="mb-6 text-xs font-black uppercase tracking-widest text-slate-500">
                    Checklist
                  </p>
                  <ul class="space-y-4 text-sm font-bold text-slate-700">
                    <li
                      v-for="item in stepChecklists[idx]"
                      :key="item"
                      class="flex items-center gap-2"
                    >
                      <CheckCircle2 class="h-4 w-4 text-emerald-500" />
                      {{ item }}
                    </li>
                  </ul>
                </template>

                <template v-else-if="idx < 4">
                  <p class="mb-6 text-xs font-black uppercase tracking-widest text-slate-500">
                    Q/A
                  </p>
                  <div class="space-y-4">
                    <div
                      v-for="item in stepQaBlocks[idx - 2]"
                      :key="item.q"
                      class="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p class="text-[11px] font-black uppercase tracking-wide text-slate-500">Q</p>
                      <p class="text-sm font-semibold text-slate-900">{{ item.q }}</p>
                      <p
                        class="mt-2 text-[11px] font-black uppercase tracking-wide text-emerald-600"
                      >
                        A
                      </p>
                      <p class="text-sm text-slate-700">{{ item.a }}</p>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <p class="mb-6 text-xs font-black uppercase tracking-widest text-slate-500">
                    Signal Scores
                  </p>
                  <div class="space-y-3">
                    <div
                      v-for="item in stepSignalBadges[idx - 4]"
                      :key="item.label"
                      class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <span class="text-sm font-semibold text-slate-800">{{ item.label }}</span>
                      <span
                        class="rounded-md px-2 py-1 text-xs font-bold uppercase"
                        :class="
                          item.score === 'High'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        "
                      >
                        {{ item.score }}
                      </span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </section>
        </div>

        <!-- 7. FAILURE ANALYSIS -->
        <section id="failure" class="mb-40 scroll-mt-24">
          <h2 class="mb-10 text-3xl font-black tracking-tight text-slate-900">
            Why Most Ideas Fail Validation
          </h2>
          <ul class="space-y-6">
            <li v-for="reason in failureReasons" :key="reason.t">
              <div class="flex items-start gap-3">
                <XCircle class="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <div>
                  <h4 class="text-lg font-black text-slate-900">{{ reason.t }}</h4>
                  <p class="mt-1 text-base leading-relaxed text-slate-700">{{ reason.d }}</p>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- 8. FINAL CTA -->
        <section
          class="relative overflow-hidden rounded-xl bg-slate-900 p-16 text-center text-white"
        >
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"
          ></div>
          <div class="relative z-10">
            <h2 class="mb-6 text-4xl font-black tracking-tighter lg:text-5xl">
              Stop guessing. <br class="sm:hidden" />Start validating.
            </h2>
            <p class="mx-auto mb-10 max-w-md text-lg text-slate-300">
              Join 1,000+ founders who use this system to build evidence-backed startups.
            </p>
            <NuxtLink
              to="/recommendation"
              class="group inline-flex items-center gap-3 rounded-2xl border-4 border-white bg-emerald-600 px-10 py-5 text-lg font-black text-white transition-colors hover:bg-emerald-500 active:scale-95"
            >
              Validate Your Idea Now
              <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>
            <p class="mt-6 text-xs font-black uppercase tracking-widest text-white/40">
              No credit card required • Instant access
            </p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
