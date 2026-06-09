<script setup>
  import { ref, onMounted } from 'vue'
  import PricingCards from '@/components/pricing/PricingCards.vue'
  import ComparisonTable from '@/components/pricing/ComparsionTable.vue'
  import FAQ from '@/components/pricing/FAQs.vue'

  definePageMeta({
    layout: 'marketing',
    middleware: 'marketing-layout'
  })

  const billing = ref('yearly')
  const { $posthog } = useNuxtApp()

  onMounted(() => {
    const posthog = typeof $posthog === 'function' ? $posthog() : $posthog
    posthog?.capture?.('pricing_page_viewed')
  })
</script>

<template>
  <div class="min-h-screen bg-app-bg text-app-text">
    <main class="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
      <div class="mx-auto max-w-2xl text-center sm:max-w-3xl">
        <h1 class="text-sm font-semibold text-emerald-500">Pricing</h1>

        <h2 class="mt-2 text-3xl font-bold text-app-text sm:text-4xl lg:text-5xl">
          Simple, transparent pricing
        </h2>

        <p class="mt-4 text-base leading-relaxed text-app-muted sm:mt-6 sm:text-lg">
          Choose the plan that's right for your stage. Whether you're just starting or scaling
          multiple ideas, we've got you covered.
        </p>
      </div>

      <PricingCards v-model:billing="billing" />

      <!-- Mobile scroll hint -->
      <p class="mb-4 mt-12 text-center text-sm text-app-muted sm:hidden">
        Swipe horizontally to compare →
      </p>

      <div
        class="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 sm:px-6 lg:static lg:left-auto lg:right-auto lg:mx-0 lg:w-auto lg:px-0"
      >
        <ComparisonTable />
      </div>

      <FAQ />
    </main>
  </div>
</template>
