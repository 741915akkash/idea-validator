<script setup>
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { Menu, X } from 'lucide-vue-next'

  const sidebarOpen = ref(false)

  // Optional safety: close on any route change
  const route = useRoute()
  watch(
    () => route.fullPath,
    () => {
      sidebarOpen.value = false
    }
  )
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-white text-gray-800">
    <!-- MOBILE SIDEBAR OVERLAY -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/30" @click="sidebarOpen = false" />

      <!-- sidebar -->
      <div class="relative z-50 h-full w-64 overflow-y-auto bg-white p-4 shadow-xl">
        <button class="mb-4" @click="sidebarOpen = false">
          <X class="h-5 w-5" />
        </button>

        <!-- 🔥 listen for navigate -->
        <DocsSidebar @navigate="sidebarOpen = false" />
      </div>
    </div>

    <!-- LEFT SIDEBAR (DESKTOP ONLY) -->
    <aside class="hidden w-64 overflow-y-auto border-r border-gray-200 p-4 lg:block">
      <DocsSidebar />
    </aside>

    <!-- MAIN CONTENT -->
    <div class="flex flex-1 flex-col">
      <!-- MOBILE TOP BAR -->
      <div class="flex items-center gap-3 border-b px-4 py-3 lg:hidden">
        <button @click="sidebarOpen = true">
          <Menu class="h-6 w-6" />
        </button>
        <span class="text-sm font-semibold">Docs</span>
      </div>

      <!-- CONTENT -->
      <main class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <slot />
      </main>
    </div>

    <!-- RIGHT TOC (DESKTOP ONLY) -->
    <aside class="hidden w-64 overflow-y-auto border-l border-gray-200 p-4 lg:block">
      <DocsTOC />
    </aside>
  </div>
</template>
