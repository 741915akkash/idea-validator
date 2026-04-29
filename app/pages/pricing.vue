<script setup>
  import { Check, X, ChevronDown, ChevronUp } from 'lucide-vue-next'
  import { ref, onMounted } from 'vue'

  definePageMeta({
    layout: 'marketing',
    middleware: 'marketing-layout'
  })

  const billing = ref('yearly')

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer:
        "Yes, anytime. We don't believe in locking people into systems that don't provide value."
    },
    {
      question: 'What if my idea fails?',
      answer:
        'That is exactly the goal - to fail fast and cheap before wasting months of your life building something nobody wants.'
    },
    {
      question: 'Is this for non-technical founders?',
      answer:
        'Absolutely. The system is designed around customer discovery and market signals, not code.'
    },
    {
      question: 'Do you offer a free trial?',
      answer:
        'We have a permanent Free plan that allows you to validate 1 idea with basic tools. No credit card required.'
    }
  ]

  const features = [
    { name: 'Active ideas', free: '2', growth: '5', founder: '5', isBold: true },
    {
      name: 'Archived ideas',
      free: '3',
      growth: '50',
      founder: '100',
      isBold: true
    },
    {
      name: 'Revisions per idea',
      free: '30',
      growth: 'Unlimited',
      founder: 'Unlimited',
      isBold: true
    },
    {
      name: 'Freeform interviews',
      free: '30/month/idea',
      growth: 'Unlimited',
      founder: 'Unlimited',
      isBold: true
    },
    {
      name: 'Structured validation (AI)',
      free: '❌',
      growth: 'Full',
      founder: 'Full',
      isBold: true
    },
    { name: 'AI scoring & breakdown', free: '❌', growth: '✅', founder: '✅', isBold: true },
    { name: 'Compare revisions', free: '✅', growth: '✅', founder: '✅', isBold: true },
    { name: 'Notes & diff tracking', free: '✅', growth: '✅', founder: '✅', isBold: true },
    { name: 'History view', free: '✅', growth: '✅', founder: '✅', isBold: true },
    {
      name: 'CRM',
      free: '❌',
      growth: 'Included (when released)',
      founder: 'Full access (when released)',
      isBold: true,
      badge: 'Coming Soon'
    },
    {
      name: 'Social lead finder',
      free: '❌',
      growth: 'Included (when released)',
      founder: 'Generous (when released)',
      isBold: true,
      badge: 'Coming Soon'
    },
    {
      name: 'Market research agent',
      free: '❌',
      growth: 'Included (when released)',
      founder: 'Generous (when released)',
      isBold: true,
      badge: 'Coming Soon'
    },
    { name: 'AI priority / speed', free: '❌', growth: 'Standard', founder: 'High', isBold: true },
    { name: 'Early feature access', free: '❌', growth: '✅', founder: '✅', isBold: true },
    { name: 'Priority support', free: '❌', growth: '✅', founder: '✅', isBold: true }
  ]

  const openFaq = ref(0)

  function toggleFaq(index) {
    openFaq.value = openFaq.value === index ? null : index
  }

  const { $posthog } = useNuxtApp()

  onMounted(() => {
    const posthog = typeof $posthog === 'function' ? $posthog() : $posthog
    posthog?.capture?.('pricing_page_viewed')
  })
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-16 lg:py-24">
    <!-- PRICING HEADER -->
    <div class="mx-auto max-w-3xl text-center">
      <h1 class="text-base font-semibold leading-7 text-emerald-600">Pricing</h1>
      <h1 class="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">
        Simple, transparent pricing
      </h1>
      <p class="mt-6 text-lg leading-8 text-slate-700">
        Choose the plan that's right for your stage. Whether you're just starting or scaling
        multiple ideas, we've got you covered.
      </p>
    </div>

    <!-- PRICING CARDS GRID -->
    <div class="mx-auto mt-16 grid max-w-md gap-8 lg:max-w-6xl lg:grid-cols-3">
      <!-- 1. FREE PLAN -->
      <div
        class="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-slate-200 transition-shadow duration-300 hover:shadow-lg xl:p-10"
      >
        <div>
          <div class="flex items-center justify-between gap-x-4">
            <h2 class="text-lg font-semibold leading-8 text-slate-900">Free</h2>
          </div>
          <p class="mt-4 text-sm leading-6 text-slate-600">
            Perfect for testing the waters and learning the framework.
          </p>
          <p class="mt-6 flex items-baseline gap-x-1">
            <span class="text-4xl font-bold tracking-tight text-slate-900">$0</span>
            <span class="text-sm font-semibold leading-6 text-slate-400">/forever</span>
          </p>
          <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-slate-600">
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              2 active ideas + 3 archived ideas
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              30 revisions per idea
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              30 freeform interviews/month/idea
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Compare revisions, notes & diff tracking
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              History view
            </li>
          </ul>
        </div>
        <a
          href="#"
          class="mt-8 block rounded-xl px-4 py-3 text-center text-base font-bold leading-6 text-slate-900 ring-2 ring-inset ring-slate-300 transition-all hover:bg-slate-50 hover:ring-slate-400"
        >
          Get started for free
        </a>
      </div>

      <!-- 2. GROWTH PLAN (With Internal Toggle) -->
      <div
        class="relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 transition-all duration-300 xl:p-10"
      >
        <div>
          <div class="flex items-center justify-between gap-x-4">
            <h2 class="text-lg font-semibold leading-8 text-slate-900">Growth</h2>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Validate ideas faster with serious tools — not guesswork.
          </p>

          <!-- Internal Toggle -->
          <div class="mt-4 flex justify-center">
            <div class="inline-flex flex-col">
              <div class="inline-flex rounded-lg border border-black bg-slate-100 p-1">
                <button
                  @click="billing = 'monthly'"
                  class="rounded-md px-3 py-1 text-xs font-bold transition-all"
                  :class="
                    billing === 'monthly'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  "
                >
                  Monthly
                </button>
                <button
                  @click="billing = 'yearly'"
                  class="rounded-md px-3 py-1 text-xs font-bold transition-all"
                  :class="
                    billing === 'yearly'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  "
                >
                  Yearly
                </button>
              </div>
              <p
                class="mt-2 h-4 self-end pr-1 text-right text-xs font-semibold transition-opacity"
                :class="billing === 'yearly' ? 'text-emerald-600 opacity-100' : 'opacity-0'"
              >
                Save 33%
              </p>
            </div>
          </div>

          <div class="mt-6 h-20">
            <div v-if="billing === 'monthly'">
              <p class="flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-slate-900">$9</span>
                <span class="text-sm font-semibold leading-6 text-slate-400">/mo</span>
              </p>
              <p class="mt-1 text-xs text-slate-400">Billed monthly</p>
            </div>
            <div v-else>
              <p class="flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-slate-900">$72</span>
                <span class="text-sm font-semibold leading-6 text-slate-400">/year</span>
              </p>
              <p class="mt-1 text-sm font-bold text-emerald-600">$6/month billed yearly</p>
            </div>
          </div>

          <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-slate-600">
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              5 active ideas + 50 archived ideas
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Unlimited revisions + freeform interviews
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Full structured validation + AI scoring
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Early feature access + priority support
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              CRM, Social lead finder, Market research agent included (when released)
            </li>
          </ul>
          <p class="mt-5 text-sm font-medium text-slate-700">
            Everything you need to validate and move forward
          </p>
        </div>
        <a
          href="#"
          class="mt-8 block rounded-xl bg-slate-900 px-4 py-3 text-center text-base font-bold leading-6 text-white shadow-sm transition-all hover:bg-slate-800"
        >
          Start Growing
        </a>
      </div>

      <!-- 3. FOUNDER PASS (2-Year Plan) -->
      <div
        class="relative z-10 flex flex-col justify-between rounded-3xl bg-slate-900 p-8 shadow-2xl ring-4 ring-emerald-500 lg:scale-105 xl:p-10"
      >
        <div
          class="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white"
        >
          🔥 Founder Pass
        </div>
        <div class="text-white">
          <div class="flex items-center justify-between gap-x-4">
            <h2 class="text-lg font-semibold leading-8">2-Year Access</h2>
          </div>
          <div class="mt-2">
            <span
              class="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-amber-900"
            >
              Limited Time Offer
            </span>
          </div>
          <p class="mt-4 text-sm leading-6 text-slate-300">
            Lock in early access before plans evolve.
          </p>
          <div class="mt-6">
            <p class="flex items-baseline gap-x-1">
              <span class="text-5xl font-bold tracking-tight text-white">$99</span>
              <span class="text-sm font-semibold leading-6 text-slate-400">/2 years</span>
            </p>
            <p class="mt-2 text-lg font-bold text-emerald-400">$4.1/month billed once</p>
            <p class="mt-4 text-xl font-extrabold text-white">Better limits. Better access.</p>
            <p class="mt-1 text-sm font-medium text-emerald-200">Generous limits on new features.</p>
          </div>

          <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-slate-300">
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-400" aria-hidden="true" />
              5 active ideas + 100 archived ideas
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-400" aria-hidden="true" />
              Unlimited revisions + freeform interviews
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-400" aria-hidden="true" />
              Full structured validation + AI scoring
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-400" aria-hidden="true" />
              High AI priority / speed
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-400" aria-hidden="true" />
              Full CRM + generous Social lead finder/Market research (when released)
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-400" aria-hidden="true" />
              Early feature access + priority support
            </li>
          </ul>
          <div class="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Early Adopter Advantage
            </p>
            <ul class="mt-2 space-y-1 text-sm text-slate-200">
              <li>Future plans will have stricter limits</li>
              <li>Pricing will increase as new features launch</li>
            </ul>
          </div>
        </div>
        <a
          href="#"
          class="mt-8 block rounded-xl bg-emerald-500 px-4 py-3 text-center text-base font-extrabold leading-6 text-white shadow-sm transition-all hover:bg-emerald-400"
        >
          Lock Founder Pricing
        </a>
      </div>
    </div>

    <!-- COMPARISON TABLE -->
    <div class="mt-32">
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Compare features
        </h2>
        <p class="mt-4 text-lg text-slate-700">
          A detailed breakdown of everything included in each plan.
        </p>
      </div>

      <div class="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full min-w-[600px] table-fixed border-collapse text-left">
          <colgroup>
            <col class="w-2/5" />
            <col class="w-1/5" />
            <col class="w-1/5" />
            <col class="w-1/5" />
          </colgroup>
          <thead>
            <tr class="bg-slate-50">
              <th class="px-8 py-4 text-base font-bold tracking-tight text-slate-900 sm:px-16">
                Feature
              </th>
              <th class="px-6 py-4 text-center text-base font-bold tracking-tight text-slate-900">
                Free
              </th>
              <th class="px-6 py-4 text-center text-base font-bold tracking-tight text-slate-900">
                Growth
              </th>
              <th class="px-6 py-4 text-center text-base font-bold tracking-tight text-slate-900">
                Founder
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="f in features" :key="f.name">
              <td class="px-8 py-4 text-sm text-slate-700 sm:px-16">
                {{ f.name }}
                <span
                  v-if="f.badge"
                  class="ml-2 inline-flex items-center whitespace-nowrap rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                >
                  {{ f.badge }}
                </span>
              </td>
              <td class="px-6 py-4 text-center align-middle">
                <template v-if="f.free === '✅'">
                  <Check class="mx-auto h-5 w-5 text-emerald-600" />
                </template>
                <template v-else-if="f.free === '❌'">
                  <X class="mx-auto h-5 w-5 text-rose-500" />
                </template>
                <span v-else class="text-sm font-medium leading-6 text-slate-800" :class="{ 'font-bold': f.isBold }">
                  {{ f.free }}
                </span>
              </td>
              <td class="px-6 py-4 text-center align-middle">
                <template v-if="f.growth === '✅'">
                  <Check class="mx-auto h-5 w-5 text-emerald-600" />
                </template>
                <template v-else-if="f.growth === '❌'">
                  <X class="mx-auto h-5 w-5 text-rose-500" />
                </template>
                <span v-else class="text-sm font-medium leading-6 text-slate-900" :class="{ 'font-bold': f.isBold }">
                  {{ f.growth }}
                </span>
              </td>
              <td class="px-6 py-4 text-center align-middle">
                <template v-if="f.founder === '✅'">
                  <Check class="mx-auto h-5 w-5 text-emerald-600" />
                </template>
                <template v-else-if="f.founder === '❌'">
                  <X class="mx-auto h-5 w-5 text-rose-500" />
                </template>
                <span v-else class="text-sm font-medium leading-6 text-slate-900" :class="{ 'font-bold': f.isBold }">
                  {{ f.founder }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FAQ -->
    <div class="mx-auto mt-32 max-w-3xl">
      <h2 class="mb-12 text-center text-3xl font-extrabold tracking-tight text-slate-900">
        Pricing FAQ
      </h2>
      <div class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200"
        >
          <button
            @click="toggleFaq(index)"
            class="flex w-full items-center justify-between p-6 text-left"
          >
            <span class="text-lg font-bold leading-7 text-slate-600">{{ faq.question }}</span>
            <ChevronDown v-if="openFaq !== index" class="h-5 w-5 text-slate-400" />
            <ChevronUp v-else class="h-5 w-5 text-slate-900" />
          </button>
          <div v-if="openFaq === index" class="px-6 pb-6 text-sm leading-relaxed text-slate-700">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
