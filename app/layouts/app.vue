<script setup>
import { ref } from 'vue'
import { Menu, Target } from 'lucide-vue-next'
import Sidebar from '~/components/landing2/Sidebar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-white font-sans">
    <Sidebar class="hidden md:flex md:pt-10" />

    <div v-if="sidebarOpen" class="fixed inset-0 z-40 md:hidden">
      <div class="absolute inset-0 bg-black/30" @click="sidebarOpen = false" />

      <div class="relative z-50 w-64">
        <Sidebar />
      </div>
    </div>

    <div class="flex flex-1 flex-col">
      <div class="flex items-center gap-3 border-b px-4 py-2 md:hidden">
        <button @click="sidebarOpen = true">
          <Menu class="h-6 w-6" />
        </button>

        <NuxtLink to="/" class="flex items-center gap-2">
          <Target class="h-6 w-6 text-emerald-600" />
          <span class="text-lg font-semibold tracking-tight text-slate-900">Idea Validator</span>
        </NuxtLink>
      </div>

      <main class="flex-1 px-4 pt-2 pb-6 md:hidden">
        <slot />
      </main>

      <main class="hidden min-w-0 flex-1 px-5 pt-2 pb-6 md:block">
        <slot />
      </main>
    </div>
  </div>
</template>
