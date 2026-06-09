<script setup>
  import { ref } from 'vue'
  import { Menu, Target, Orbit, X } from 'lucide-vue-next'

  const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen font-sans text-app-text">
    <header class="sticky top-0 z-50 border-b border-app-border text-app-text">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-2">
          <Orbit class="h-6 w-6 text-emerald-600" />
          <span class="text-lg font-semibold text-app-text">GO Launch Scall</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-sm font-medium text-app-text md:flex">
          <NuxtLink to="/general/how-it-works" class="transition hover:text-app-text"
            >How it works</NuxtLink
          >
          <NuxtLink to="/general/pricing" class="transition hover:text-app-text">Pricing</NuxtLink>
          <NuxtLink to="/blog" class="transition hover:text-app-text">Blog</NuxtLink>
          <NuxtLink to="/general/signup-login?mode=login" class="transition hover:text-app-text"
            >Login</NuxtLink
          >
          <NuxtLink
            to="/general/signup-login?mode=signup"
            class="rounded-md bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-700"
          >
            Signup
          </NuxtLink>
        </nav>

        <button
          class="inline-flex items-center justify-center rounded-md p-2 text-app-text hover:bg-app-hover md:hidden"
          :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" class="h-5 w-5" />
          <Menu v-else class="h-5 w-5" />
        </button>
      </div>

      <div
        v-if="mobileMenuOpen"
        class="border-t border-app-border px-4 py-3 text-app-text md:hidden"
      >
        <nav class="flex flex-col gap-2 text-sm font-medium text-app-text">
          <NuxtLink
            to="/general/how-it-works"
            class="rounded-md px-2 py-2 hover:bg-app-hover"
            @click="mobileMenuOpen = false"
          >
            How it works
          </NuxtLink>
          <NuxtLink
            to="/general/pricing"
            class="rounded-md px-2 py-2 hover:bg-app-hover"
            @click="mobileMenuOpen = false"
          >
            Pricing
          </NuxtLink>
          <NuxtLink
            to="/blog"
            class="rounded-md px-2 py-2 hover:bg-app-hover"
            @click="mobileMenuOpen = false"
          >
            Blog
          </NuxtLink>
          <NuxtLink
            to="/general/signup-login?mode=login"
            class="rounded-md px-2 py-2 hover:bg-app-hover"
            @click="mobileMenuOpen = false"
          >
            Login
          </NuxtLink>
          <NuxtLink
            to="/general/signup-login?mode=signup"
            class="mt-1 rounded-md bg-emerald-600 px-3 py-2 text-center text-white hover:bg-emerald-700"
            @click="mobileMenuOpen = false"
          >
            Signup
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
