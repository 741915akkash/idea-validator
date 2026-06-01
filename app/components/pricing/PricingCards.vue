<script setup>
  import { Check } from 'lucide-vue-next'

  const props = defineProps(['billing'])
  const emit = defineEmits(['update:billing'])

  const setBilling = (value) => {
    emit('update:billing', value)
  }
</script>

<template>
  <div class="mx-auto mt-12 grid w-full gap-5 sm:mt-16 sm:gap-6 lg:max-w-5xl lg:grid-cols-2">
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
              <span class="text-3xl font-bold sm:text-4xl">$19</span>
              <span class="text-sm font-semibold text-slate-400">/mo</span>
            </p>
            <p class="mt-1 text-xs text-slate-400">Billed monthly</p>
          </div>
          <div v-else>
            <p class="flex items-baseline gap-x-1">
              <span class="text-3xl font-bold sm:text-4xl">$190</span>
              <span class="text-sm font-semibold text-slate-400">/year</span>
            </p>
            <p class="mt-1 text-sm font-bold text-emerald-600">$15/month billed yearly</p>
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
  </div>
</template>
