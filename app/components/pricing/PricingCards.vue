<script setup>
  import { Check } from 'lucide-vue-next'

  const props = defineProps(['billing'])
  const emit = defineEmits(['update:billing'])

  const setBilling = (value) => {
    emit('update:billing', value)
  }
</script>

<template>
  <div class="mx-auto mt-12 grid w-full gap-5 sm:mt-16 sm:gap-6 lg:max-w-6xl lg:grid-cols-3">
    <!-- FREE -->
    <div
      class="flex flex-col justify-between rounded-3xl bg-white p-6 ring-1 ring-slate-200 transition-shadow duration-300 hover:shadow-lg sm:p-8 xl:p-10"
    >
      <div class="min-w-0">
        <h3 class="text-lg font-semibold leading-8">Free</h3>
        <p class="mt-4 text-sm leading-6 text-slate-600">
          Perfect for testing the waters and learning the framework.
        </p>
        <p class="mt-6 flex items-baseline gap-x-1">
          <span class="text-3xl font-bold tracking-tight sm:text-4xl">$0</span>
          <span class="text-sm font-semibold leading-6 text-slate-400">/forever</span>
        </p>
        <ul class="mt-8 space-y-3 text-sm leading-6 text-slate-600">
          <li
            v-for="item in [
              '2 active ideas + 3 archived ideas',
              '30 revisions per idea',
              '30 freeform interviews/month/idea',
              'Compare revisions, notes & diff tracking',
              'History view'
            ]"
            :key="item"
            class="flex min-w-0 gap-x-3"
          >
            <Check class="mt-0.5 h-5 w-5 flex-none text-emerald-600 sm:h-6 sm:w-5" />
            <span class="min-w-0 break-words">{{ item }}</span>
          </li>
        </ul>
      </div>
      <button
        class="mt-8 block w-full rounded-xl px-4 py-3 text-center text-base font-bold text-slate-900 ring-2 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 sm:py-3.5"
      >
        Get started free
      </button>
    </div>

    <!-- GROWTH -->
    <div
      class="relative flex flex-col justify-between rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8 xl:p-10"
    >
      <div class="min-w-0">
        <h3 class="text-lg font-semibold leading-8">Growth</h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Validate ideas faster with serious tools — not guesswork.
        </p>

        <div class="mt-4 flex justify-center sm:justify-start">
          <div class="inline-flex flex-col">
            <div class="inline-flex rounded-lg border border-black bg-slate-100 p-1">
              <button
                @click="setBilling('monthly')"
                :class="[
                  'rounded-md px-3 py-1 text-xs font-bold transition-all',
                  billing === 'monthly' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                ]"
              >
                Monthly
              </button>
              <button
                @click="setBilling('yearly')"
                :class="[
                  'rounded-md px-3 py-1 text-xs font-bold transition-all',
                  billing === 'yearly' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                ]"
              >
                Yearly
              </button>
            </div>
            <p
              v-if="billing === 'yearly'"
              class="mt-2 text-right text-xs font-semibold text-emerald-600"
            >
              Save 33%
            </p>
          </div>
        </div>

        <div class="mt-6 h-20">
          <div v-if="billing === 'monthly'">
            <p class="flex items-baseline gap-x-1">
              <span class="text-3xl font-bold sm:text-4xl">$9</span>
              <span class="text-sm font-semibold text-slate-400">/mo</span>
            </p>
            <p class="mt-1 text-xs text-slate-400">Billed monthly</p>
          </div>
          <div v-else>
            <p class="flex items-baseline gap-x-1">
              <span class="text-3xl font-bold sm:text-4xl">$72</span>
              <span class="text-sm font-semibold text-slate-400">/year</span>
            </p>
            <p class="mt-1 text-sm font-bold text-emerald-600">$6/month billed yearly</p>
          </div>
        </div>

        <ul class="mt-8 space-y-3 text-sm leading-6 text-slate-600">
          <li
            v-for="item in [
              '5 active ideas + 50 archived ideas',
              'Unlimited revisions + freeform interviews',
              'Full structured validation + AI scoring',
              'Early feature access + priority support',
              'CRM, Social lead finder, Market research agent included (when released)'
            ]"
            :key="item"
            class="flex min-w-0 gap-x-3"
          >
            <Check class="mt-0.5 h-5 w-5 flex-none text-emerald-600 sm:h-6 sm:w-5" />
            <span class="min-w-0 break-words">{{ item }}</span>
          </li>
        </ul>
        <p class="mt-5 text-sm font-medium text-slate-700">
          Everything you need to validate and move forward
        </p>
      </div>
      <button
        class="mt-8 block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-base font-bold text-white transition-colors hover:bg-slate-800 sm:py-3.5"
      >
        Start Growing
      </button>
    </div>

    <!-- FOUNDER -->
    <div
      class="relative z-10 flex scale-100 flex-col justify-between rounded-3xl bg-slate-900 p-6 shadow-2xl ring-4 ring-emerald-500 sm:p-8 lg:scale-105 xl:p-10"
    >
      <div
        class="absolute -top-4 left-1/2 max-w-[85%] -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase text-white shadow-sm sm:px-4 sm:text-xs"
      >
        🔥 Founder Pass
      </div>
      <div class="min-w-0 text-white">
        <h3 class="text-lg font-semibold leading-8">2-Year Access</h3>
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
            <span class="text-4xl font-bold text-white sm:text-5xl">$99</span>
            <span class="text-sm font-semibold text-slate-400">/2 years</span>
          </p>
          <p class="mt-2 text-lg font-bold text-emerald-400">$4.1/month billed once</p>
          <p class="mt-4 text-xl font-extrabold text-white">Better limits. Better access.</p>
          <p class="mt-1 text-sm font-medium text-emerald-200">Generous limits on new features.</p>
        </div>
        <ul class="mt-8 space-y-3 text-sm leading-6 text-slate-300">
          <li
            v-for="item in [
              '5 active ideas + 100 archived ideas',
              'Unlimited revisions + freeform interviews',
              'Full structured validation + AI scoring',
              'High AI priority / speed',
              'Full CRM + generous Social lead finder/Market research (when released)',
              'Early feature access + priority support'
            ]"
            :key="item"
            class="flex min-w-0 gap-x-3"
          >
            <Check class="mt-0.5 h-5 w-5 flex-none text-emerald-400 sm:h-6 sm:w-5" />
            <span class="min-w-0 break-words">{{ item }}</span>
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
      <button
        class="mt-8 block w-full rounded-xl bg-emerald-500 px-4 py-3 text-center text-base font-extrabold text-white transition-colors hover:bg-emerald-400 sm:py-3.5"
      >
        Lock Founder Pricing
      </button>
    </div>
  </div>
</template>
