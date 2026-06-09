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
  <div class="flex h-screen overflow-hidden text-app-text">
    <!-- MOBILE SIDEBAR -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden">
      <div class="absolute inset-0 bg-black/30" @click="sidebarOpen = false" />

      <div
  class="relative z-50 h-full w-72 overflow-y-auto border-r border-app-border bg-app-panel p-4"
>
        <button class="mb-4" @click="sidebarOpen = false">
          <X class="h-5 w-5" />
        </button>

        <DocsSidebar @navigate="sidebarOpen = false" />
      </div>
    </div>

    <!-- LEFT SIDEBAR -->
    <aside
  class="hidden w-72 overflow-y-auto border-r border-app-border bg-app-panel p-4 lg:block"
>
      <DocsSidebar />
    </aside>

    <!-- MAIN -->
    <div class="flex flex-1 flex-col">
      <!-- MOBILE TOP BAR -->
      <div
  class="flex items-center gap-3 border-b border-app-border bg-app-panel px-4 py-3 lg:hidden"
>
        <button @click="sidebarOpen = true">
          <Menu class="h-6 w-6" />
        </button>
        <span class="text-sm font-semibold">Docs</span>
      </div>

      <!-- CONTENT + TOC WRAPPED -->
      <main
  class="flex-1 overflow-y-auto bg-app-bg px-4 py-6 text-app-text sm:px-6 sm:py-8 lg:px-10"
>
        <div class="mx-auto flex w-full max-w-6xl gap-10">
          <!-- MAIN CONTENT -->
          <div class="w-full max-w-3xl">
            <slot />
          </div>

          <!-- RIGHT TOC (ATTACHED) -->
          <aside class="hidden w-56 shrink-0 lg:block">
            <div class="sticky top-20 border-l border-app-border pl-6">
              <DocsTOC />
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>
