<script setup>
  import { Check, Minus, Plus, ChevronDown, ChevronUp, HelpCircle } from 'lucide-vue-next'

  definePageMeta({
    layout: 'marketing'
  })
  import { ref, computed } from 'vue'

  const billing = ref('6m')

  const pricing = {
    monthly: { price: 9, label: 'Monthly' },
    '6m': { price: 36, label: '6 months', note: 'Most founders choose this' },
    '12m': { price: 60, label: '12 months', note: 'Best for serious builders' }
  }

  const current = computed(() => pricing[billing.value])

  const perMonth = computed(() => {
    if (billing.value === 'monthly') return current.value.price
    if (billing.value === '6m') return (current.value.price / 6).toFixed(0)
    if (billing.value === '12m') return (current.value.price / 12).toFixed(0)
    return 0
  })

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

  const openFaq = ref(0)

  function toggleFaq(index) {
    openFaq.value = openFaq.value === index ? null : index
  }
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-16 lg:py-24">
    <!-- PRICING HEADER -->
    <div class="mx-auto max-w-3xl text-center">
      <h1 class="text-base font-semibold leading-7 text-emerald-600">Pricing</h1>
      <h1 class="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">
        Simple, transparent pricing
      </h1>
      <p class="mt-6 text-lg leading-8 text-slate-600">
        Choose the plan that's right for your stage. Whether you're just starting or scaling
        multiple ideas, we've got you covered.
      </p>
    </div>

    <!-- BILLING TOGGLE -->
    <div class="mt-16 flex flex-col items-center">
      <div class="relative flex rounded-full bg-slate-100 p-1 shadow-inner">
        <button
          v-for="(val, key) in pricing"
          :key="key"
          @click="billing = key"
          class="relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-200"
          :class="
            billing === key
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          "
        >
          {{ val.label }}
        </button>
      </div>
      <p v-if="billing !== 'monthly'" class="mt-4 text-sm font-medium text-emerald-600">
        Save up to 45% with annual billing
      </p>
    </div>

    <!-- PRICING CARDS -->
    <div class="mx-auto mt-12 grid max-w-md gap-8 lg:max-w-4xl lg:grid-cols-2">
      <!-- FREE PLAN -->
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
            <span class="text-4xl font-bold text-slate-900">$0</span>
            <span class="text-sm font-semibold leading-6 text-slate-400">/forever</span>
          </p>
          <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-slate-600">
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              1 active idea validation
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              20 interview templates
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Basic AI insight reports
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Community support
            </li>
          </ul>
        </div>
        <a
          href="#"
          class="mt-8 block rounded-xl px-3 py-2 text-center text-sm font-semibold leading-6 ring-1 ring-inset ring-slate-200 transition-all hover:ring-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Get started for free
        </a>
      </div>

      <!-- GROWTH PLAN -->
      <div
        class="relative z-10 flex scale-105 flex-col justify-between rounded-3xl bg-white p-8 shadow-2xl ring-2 ring-emerald-500 xl:p-10"
      >
        <div
          class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase text-white"
        >
          Most Popular
        </div>
        <div>
          <div class="flex items-center justify-between gap-x-4">
            <h2 class="text-lg font-semibold leading-8 text-slate-900">Growth</h2>
          </div>
          <p class="mt-4 text-sm leading-6 text-slate-600">
            For serious builders who want to move fast and avoid failure.
          </p>
          <p class="mt-6 flex items-baseline gap-x-1">
            <span class="text-4xl font-bold text-slate-900"
              >${{ current.price }}</span
            >
            <span class="text-sm font-semibold leading-6 text-slate-400"
              >/{{ billing === 'monthly' ? 'mo' : billing }}</span
            >
          </p>
          <p class="mt-1 text-xs text-slate-400">Equivalent to ${{ perMonth }}/month</p>

          <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-slate-600">
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              5 active idea validations
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              50 interviews per month
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Advanced AI sentiment analysis
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Full validation dashboard
            </li>
            <li class="flex gap-x-3">
              <Check class="h-6 w-5 flex-none text-emerald-600" aria-hidden="true" />
              Priority email support
            </li>
            <li class="flex items-center gap-x-3 text-slate-400">
              <Check class="h-6 w-5 flex-none text-slate-300" aria-hidden="true" />
              <span class="flex items-center gap-x-2">
                CRM
                <span
                  class="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  >Coming Soon</span
                >
              </span>
            </li>
            <li class="flex items-center gap-x-3 text-slate-400">
              <Check class="h-6 w-5 flex-none text-slate-300" aria-hidden="true" />
              <span class="flex items-center gap-x-2">
                Social Media Leads Finder
                <span
                  class="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  >Coming Soon</span
                >
              </span>
            </li>
            <li class="flex items-center gap-x-3 text-slate-400">
              <Check class="h-6 w-5 flex-none text-slate-300" aria-hidden="true" />
              <span class="flex items-center gap-x-2">
                Market Research
                <span
                  class="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  >Coming Soon</span
                >
              </span>
            </li>
          </ul>
        </div>
        <a
          href="#"
          class="mt-8 block rounded-xl bg-emerald-500 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm transition-all hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Validate my idea
        </a>
      </div>
    </div>

    <!-- COMPARISON TABLE -->
    <div class="mt-32 hidden lg:block">
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold text-slate-900">Compare features</h2>
        <p class="mt-4 text-slate-600">A detailed breakdown of everything included in each plan.</p>
      </div>
      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col class="w-1/2" />
            <col class="w-1/4" />
            <col class="w-1/4" />
          </colgroup>
          <thead>
            <tr class="bg-slate-50">
              <th class="px-16 py-4 text-sm font-semibold text-slate-900">Feature</th>
              <th class="px-6 py-4 text-center text-sm font-semibold text-slate-900">Free</th>
              <th class="px-6 py-4 text-center text-sm font-semibold text-slate-900">Growth</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">Active Ideas</td>
              <td class="px-6 py-4 text-center text-sm text-slate-900">1</td>
              <td class="px-6 py-4 text-center text-sm font-bold text-slate-900">5</td>
            </tr>
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">Interviews / month</td>
              <td class="px-6 py-4 text-center text-sm text-slate-900">20</td>
              <td class="px-6 py-4 text-center text-sm font-bold text-slate-900">50</td>
            </tr>
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">AI Sentiment Analysis</td>
              <td class="px-6 py-4 text-center text-sm text-slate-900">Basic</td>
              <td class="px-6 py-4 text-center text-sm font-bold text-slate-900">Advanced</td>
            </tr>
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">Progress Tracking</td>
              <td class="px-6 py-4 text-center">
                <Minus class="mx-auto h-4 w-4 text-slate-300" />
              </td>
              <td class="px-6 py-4 text-center">
                <Check class="mx-auto h-5 w-5 text-emerald-600" />
              </td>
            </tr>
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">Team Collaboration</td>
              <td class="px-6 py-4 text-center">
                <Minus class="mx-auto h-4 w-4 text-slate-300" />
              </td>
              <td class="px-6 py-4 text-center">
                <Minus class="mx-auto h-4 w-4 text-slate-300" />
              </td>
            </tr>
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">
                CRM
                <span
                  class="ml-2 inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  >Coming Soon</span
                >
              </td>
              <td class="px-6 py-4 text-center">
                <Minus class="mx-auto h-4 w-4 text-slate-300" />
              </td>
              <td class="px-6 py-4 text-center">
                <Check class="mx-auto h-5 w-5 text-emerald-600" />
              </td>
            </tr>
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">
                Social Media Leads Finder
                <span
                  class="ml-2 inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  >Coming Soon</span
                >
              </td>
              <td class="px-6 py-4 text-center">
                <Minus class="mx-auto h-4 w-4 text-slate-300" />
              </td>
              <td class="px-6 py-4 text-center">
                <Check class="mx-auto h-5 w-5 text-emerald-600" />
              </td>
            </tr>
            <tr>
              <td class="px-16 py-4 text-sm text-slate-600">
                Market Research
                <span
                  class="ml-2 inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  >Coming Soon</span
                >
              </td>
              <td class="px-6 py-4 text-center">
                <Minus class="mx-auto h-4 w-4 text-slate-300" />
              </td>
              <td class="px-6 py-4 text-center">
                <Check class="mx-auto h-5 w-5 text-emerald-600" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FAQ -->
    <div class="mx-auto mt-32 max-w-3xl">
      <h2 class="mb-12 text-center text-2xl font-bold text-slate-900">
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
            <span class="font-semibold text-slate-900">{{ faq.question }}</span>
            <ChevronDown v-if="openFaq !== index" class="h-5 w-5 text-slate-400" />
            <ChevronUp v-else class="h-5 w-5 text-slate-900" />
          </button>
          <div v-if="openFaq === index" class="px-6 pb-6 text-sm leading-relaxed text-slate-600">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
