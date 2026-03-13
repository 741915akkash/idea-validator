<script setup>
  import { ref } from 'vue'
  import Sidebar from '~/components/landing2/Sidebar.vue'
  import { Menu } from 'lucide-vue-next'

  const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-white font-sans">
    <!-- Desktop Sidebar -->
    <div class="hidden md:block">
      <Sidebar />
    </div>

    <!-- Mobile Sidebar -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 flex md:hidden">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black/30" @click="sidebarOpen = false" />

      <!-- Drawer -->
      <div class="relative z-50">
        <Sidebar />
      </div>
    </div>

    <!-- Page Content -->
    <div class="flex flex-1 flex-col">
      <!-- Mobile Topbar -->
      <div class="flex items-center border-b px-4 py-3 md:hidden">
        <button @click="sidebarOpen = true">
          <Menu class="h-6 w-6" />
        </button>
      </div>

      <main class="flex-1 p-6">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
