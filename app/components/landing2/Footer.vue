<template>
  <footer class="border-t border-slate-100 px-6 py-12">
    <div
      class="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"
    >
      <!-- Left: Brand -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Target class="h-5 w-5 text-emerald-600" />
          <span class="text-lg font-bold text-slate-900">GO Launch Scall</span>
        </div>
        <p class="max-w-sm text-sm text-slate-400">
          AI-powered idea validation system for founders. Validate before you build.
        </p>
      </div>

      <!-- Right: Links -->
      <div class="flex flex-col gap-6 text-sm text-slate-600 md:flex-row">
        <!-- Product -->
        <div class="flex flex-col gap-2">
          <span class="font-semibold text-slate-900">Product</span>
          <NuxtLink to="general/pricing" class="hover:text-emerald-600">Pricing</NuxtLink>
          <NuxtLink to="general/how-it-works" class="hover:text-emerald-600">How it works</NuxtLink>
        </div>

        <!-- Company -->
        <div class="flex flex-col gap-2">
          <span class="font-semibold text-slate-900">Company</span>
          <NuxtLink to="general/contact" class="hover:text-emerald-600">Contact</NuxtLink>
          <a href="mailto:support@golaunchscall.com" class="hover:text-emerald-600">
            support@golaunchscall.com
          </a>
        </div>

        <!-- Legal -->
        <div class="flex flex-col gap-2">
          <span class="font-semibold text-slate-900">Legal</span>
          <NuxtLink to="general/terms-of-service" class="hover:text-emerald-600">Terms</NuxtLink>
          <NuxtLink to="general/privacy" class="hover:text-emerald-600">Privacy</NuxtLink>
          <NuxtLink to="general/refund-policy" class="hover:text-emerald-600">Refund</NuxtLink>
        </div>
      </div>
    </div>
  
    <!-- Bottom -->
    <div
      class="mx-auto mt-10 max-w-5xl border-t border-slate-100 pt-6 text-center text-sm text-slate-400"
    >
      © 2026 GO Launch Scall. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
  import { Target } from 'lucide-vue-next'
</script>
