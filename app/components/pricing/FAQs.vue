<script setup>
  import { ChevronDown, ChevronUp } from 'lucide-vue-next'

  const faqs = [
    { q: 'Can I cancel anytime?', a: "Yes, anytime. We don't believe in locking people in." },
    {
      q: 'Is this for non-technical founders?',
      a: 'Absolutely. It is designed around customer discovery, not code.'
    },
    { q: 'Do you offer a free trial?', a: 'We have a permanent Free plan for 1 idea.' }
  ]

  const openFaq = ref(null)
  const toggleFaq = (i) => (openFaq.value === i ? null : i)
</script>

<template>
  <div class="mx-auto mt-20 max-w-3xl px-4 sm:mt-32 sm:px-0">
    <h2 class="mb-8 text-center text-2xl font-extrabold text-slate-900 sm:mb-12 sm:text-3xl">
      Pricing FAQ
    </h2>

    <div class="space-y-3 sm:space-y-4">
      <div
        v-for="(faq, i) in faqs"
        :key="i"
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <button
          @click="toggleFaq(i)"
          class="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50 sm:items-center sm:p-6"
        >
          <span class="min-w-0 break-words font-sans text-base font-bold leading-6 text-slate-600 sm:text-lg sm:leading-7">
            {{ faq.q }}
          </span>

          <component
            :is="openFaq === i ? ChevronUp : ChevronDown"
            :class="[
              'mt-0.5 h-5 w-5 flex-none transition-colors sm:mt-0',
              openFaq === i ? 'text-slate-900' : 'text-slate-400'
            ]"
          />
        </button>

        <div
          v-if="openFaq === i"
          class="px-4 pb-4 text-sm leading-relaxed text-slate-700 sm:px-6 sm:pb-6"
        >
          {{ faq.a }}
        </div>
      </div>
    </div>
  </div>
</template>
