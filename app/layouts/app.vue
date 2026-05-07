<script setup>
  import { ref } from 'vue'
  import { Menu, Target } from 'lucide-vue-next'
  import Sidebar from '~/components/landing2/Sidebar.vue'

  const sidebarOpen = ref(false)
</script>

<template>
  <!-- ✅ Allow horizontal overflow globally -->
  <div class="flex min-h-screen overflow-x-visible bg-slate-50 font-sans">
    <!-- Desktop Sidebar -->
    <Sidebar class="fixed left-0 top-0 z-40 hidden h-screen w-64 md:flex md:pt-10" />

    <!-- Mobile Sidebar Overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 md:hidden">
      <div class="absolute inset-0 bg-black/30" @click="sidebarOpen = false" />
      <div class="relative z-50 w-64">
        <Sidebar />
      </div>
    </div>

    <!-- Main Content Area -->
    <div
      class="flex flex-1 flex-col overflow-x-visible"
      :class="{
        'md:ml-64': !$route.meta.fullWidth
      }"
    >
      <!-- Mobile Top Bar -->
      <div class="flex items-center gap-3 border-b px-4 py-2 md:hidden">
        <button @click="sidebarOpen = true">
          <Menu class="h-6 w-6" />
        </button>

        <NuxtLink to="/" class="flex items-center gap-2">
          <Target class="h-6 w-6 text-emerald-600" />
          <span class="text-lg font-semibold text-slate-900">GO Launch Scall</span>
        </NuxtLink>
      </div>

      <!-- ✅ FIXED MAIN -->
      <main
        class="w-full min-w-0 flex-1 overflow-x-visible pb-6 pt-2"
        :class="$route.meta.fullWidth ? 'px-0 sm:px-0' : 'px-4 sm:px-5'"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
