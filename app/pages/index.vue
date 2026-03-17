<script setup>
import Hero from '~/components/landing2/Hero.vue'
import Problem from '~/components/landing2/Problem.vue'
import Features from '~/components/landing2/Features.vue'
import Stages from '~/components/landing2/Stages.vue'
import Comparison from '~/components/landing2/Comparison.vue'
import Cost from '~/components/landing2/Cost.vue'
import CTA from '~/components/landing2/CTA.vue'
import Footer from '~/components/landing2/Footer.vue'

definePageMeta({
  layout: 'marketing'
})
</script>

<template>
  <div>
    <Hero />
    <Problem />
    <Features />
    <Stages />
    <Comparison />
    <Cost />
    <CTA />
    <Footer />
  </div>
</template>
