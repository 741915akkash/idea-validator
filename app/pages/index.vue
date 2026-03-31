<script setup>
import { onMounted } from 'vue'
import Hero from '~/components/landing2/Hero.vue'
import Problem from '~/components/landing2/Problem.vue'
import Features from '~/components/landing2/Features.vue'
import Stages from '~/components/landing2/Stages.vue'
import Comparison from '~/components/landing2/Comparison.vue'
import Cost from '~/components/landing2/Cost.vue'
import CTA from '~/components/landing2/CTA.vue'
import Footer from '~/components/landing2/Footer.vue'
import LightExplaination from '../components/landing2/LightExplaination.vue'

definePageMeta({
  layout: 'marketing'
})

const posthog = usePostHog()

onMounted(() => {
  posthog?.capture('landing_page_viewed')
})
</script>

<template>
  <div>
    <Hero />
    <LightExplaination />
    <Problem />
    <Features />
    <Stages />
    <Comparison />
    <Cost />
    <CTA />
    <Footer />
  </div>
</template>
