<template>
  <footer id="main-footer" class="border-t border-slate-100 bg-slate-50/50 px-6 py-16">
    <div
      class="mx-auto flex max-w-5xl flex-col items-start justify-between gap-10 md:flex-row md:items-center"
    >
      <!-- Left -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Orbit class="h-5 w-5 text-emerald-600" />
          <span class="text-xl font-bold tracking-tight text-slate-900"> GO Launch Scall </span>
        </div>

        <p class="max-w-sm text-sm font-medium leading-relaxed text-slate-500">
          AI-powered idea validation system for founders. Validate before you build.
        </p>
      </div>

      <!-- Right -->
      <div class="flex flex-wrap gap-8 text-sm text-slate-600">
        <!-- Product -->
        <div class="flex flex-col gap-2.5">
          <span class="font-semibold text-slate-900">Product</span>

          <NuxtLink
            to="general/pricing"
            class="font-medium transition-colors hover:text-emerald-600"
          >
            Pricing
          </NuxtLink>

          <NuxtLink
            to="general/how-it-works"
            class="font-medium transition-colors hover:text-emerald-600"
          >
            How it works
          </NuxtLink>
        </div>

        <!-- Company -->
        <div class="flex flex-col gap-2.5">
          <span class="font-semibold text-slate-900">Company</span>

          <NuxtLink
            to="general/contact"
            class="font-medium transition-colors hover:text-emerald-600"
          >
            Contact
          </NuxtLink>

          <a
            href="mailto:support@golaunchscall.com"
            class="font-medium transition-colors hover:text-emerald-600"
          >
            support@golaunchscall.com
          </a>
        </div>

        <!-- Legal -->
        <div class="flex flex-col gap-2.5">
          <span class="font-semibold text-slate-900">Legal</span>

          <NuxtLink
            to="general/terms-of-service"
            class="font-medium transition-colors hover:text-emerald-600"
          >
            Terms
          </NuxtLink>

          <NuxtLink
            to="general/privacy"
            class="font-medium transition-colors hover:text-emerald-600"
          >
            Privacy
          </NuxtLink>

          <NuxtLink
            to="general/refund-policy"
            class="font-medium transition-colors hover:text-emerald-600"
          >
            Refund
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      class="mx-auto mt-12 max-w-5xl border-t border-slate-100 pt-6 text-center text-sm font-medium text-slate-400"
    >
      © 2026 GO Launch Scall. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
  import { Orbit } from 'lucide-vue-next'
</script>
