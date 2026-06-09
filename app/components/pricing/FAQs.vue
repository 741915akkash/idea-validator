<script setup>
  import { ChevronDown, ChevronUp } from 'lucide-vue-next'
  import { ref } from 'vue'

  const faqs = [
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. You can cancel anytime with no lock-ins or cancellation fees.'
    },
    {
      q: 'Do you offer a free trial?',
      a: 'Yes. We offer a permanent Free plan for exploring and validating 1 idea.'
    },
    {
      q: 'Is this for non-technical founders?',
      a: 'Yes. The product is designed for founders focused on customer discovery, validation, and growth — not coding.'
    },
    {
      q: 'How do credits and usage limits work?',
      a: 'AI actions and some workflows use credits depending on your plan and usage volume.'
    },
    {
      q: 'Can I change plans later?',
      a: 'Absolutely. You can upgrade or downgrade your plan anytime.'
    },
    {
      q: 'Is this an all-in-one platform?',
      a: 'Yes. Validation, interviews, notes, CRM, experiments, and research workflows are all connected in one system.'
    },
    {
      q: 'What happens after I subscribe?',
      a: 'You get immediate access to your workspace and all features included in your plan.'
    }
  ]

  const openFaq = ref(null)

  const toggleFaq = (i) => {
    openFaq.value = openFaq.value === i ? null : i
  }
</script>

<template>
  <div class="mx-auto mt-20 max-w-3xl px-4 sm:mt-32 sm:px-0">
    <h2 class="mb-8 text-center text-2xl font-extrabold text-app-text sm:mb-12 sm:text-3xl">
      Pricing FAQ
    </h2>

    <div class="space-y-3 sm:space-y-4">
      <div
        v-for="(faq, i) in faqs"
        :key="i"
        class="overflow-hidden rounded-2xl border border-app-border bg-app-panel text-app-text"
      >
        <button
          @click="toggleFaq(i)"
          class="flex w-full items-start justify-between gap-3 p-1 text-left transition-colors hover:bg-app-hover sm:items-center sm:p-6"
        >
          <span
            class="min-w-0 break-words font-sans text-md font-medium leading-6 text-app-text"
          >
            {{ faq.q }}
          </span>

          <component
            :is="openFaq === i ? ChevronUp : ChevronDown"
            :class="[
              'mt-0.5 h-5 w-5 flex-none transition-colors sm:mt-0',
              openFaq === i ? 'text-app-text' : 'text-app-muted'
            ]"
          />
        </button>

        <div
          v-if="openFaq === i"
          class="border-t border-app-border px-4 py-4 text-sm leading-relaxed text-app-text sm:px-6"
        >
          {{ faq.a }}
        </div>
      </div>
    </div>
  </div>
</template>
