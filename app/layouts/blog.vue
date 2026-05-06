<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const isMenuOpen = ref(false)
  const scrolled = ref(false)

  const handleScroll = () => {
    scrolled.value = window.scrollY > 10
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
</script>

<style>
  html {
    scroll-behavior: smooth;
  }

  h2,
  h3,
  h4 {
    scroll-margin-top: 100px;
  }

  /* Ensure prose headings also have the margin */
  .prose h2,
  .prose h3,
  .prose h4 {
    scroll-margin-top: 100px;
  }
</style>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 font-sans text-gray-900 antialiased">
    <!-- Sticky header -->
    <header
      :class="[
        'sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-shadow duration-200',
        scrolled ? 'border-gray-100 shadow-sm' : 'border-transparent'
      ]"
    >
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <!-- Logo -->
        <NuxtLink to="/" class="text-xl font-bold tracking-tight"> GO Launch Scall </NuxtLink>

        <!-- Navigation -->
        <div class="hidden items-center gap-6 md:flex">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-black transition-opacity hover:opacity-70"
          >
            Login
          </NuxtLink>
          <NuxtLink
            to="/"
            class="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Try free →
          </NuxtLink>
        </div>

        <!-- Mobile menu button -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="p-2 text-gray-600 transition-colors hover:text-black md:hidden"
          aria-label="Toggle menu"
        >
          <span v-if="!isMenuOpen" class="text-2xl">☰</span>
          <span v-else class="text-2xl">✕</span>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="isMenuOpen" class="border-t border-gray-100 bg-white px-4 pb-6 md:hidden">
        <div class="flex flex-col gap-4 pt-4 text-sm font-medium">
          <NuxtLink
            to="/"
            class="py-2 text-black transition-opacity hover:opacity-70"
            @click="isMenuOpen = false"
          >
            Login
          </NuxtLink>
          <NuxtLink
            to="/"
            class="mt-2 rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-700"
            @click="isMenuOpen = false"
          >
            Try free →
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1">
      <slot />
    </main>

    <footer class="mt-20 border-t border-gray-100 py-12 text-center text-sm text-gray-400">
      <div class="mx-auto max-w-5xl px-4">
        <p class="mb-2 font-semibold text-gray-900">GO Launch Scall</p>
        <p>&copy; 2026 GO Launch Scall. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
