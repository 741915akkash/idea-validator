<script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Menu, Target, Orbit } from 'lucide-vue-next'
  import Sidebar from '~/components/landing2/Sidebar.vue'

  import { useSearchStore } from '~/stores/search'

  const sidebarOpen = ref(false)
  const searchStore = useSearchStore()
  const route = useRoute()
  const router = useRouter()

  const openKnowledgeBase = async () => {
    if (route.path !== '/knowledge-base') {
      await router.push('/knowledge-base')
    }
  }

  const handleKeydown = async (e) => {
    // CTRL + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      await openKnowledgeBase()
      searchStore.isSearchOpen = true
      return
    }

    // ESC
    if (e.key === 'Escape') {
      searchStore.isSearchOpen = false
    }

    // CTRL + Q (Knowledge Base Quick Capture)
    if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'q') {
      e.preventDefault()
      sessionStorage.setItem('kb_open_quick_capture', '1')
      await openKnowledgeBase()
      window.dispatchEvent(new CustomEvent('kb:open-quick-capture'))
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<template>
  <div class="flex min-h-screen overflow-x-visible bg-app-bg font-sans text-app-text">
    <!-- Desktop Sidebar -->
    <Sidebar
      class="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-app-border bg-app-panel md:flex md:pt-10"
    />

    <!-- Mobile Sidebar Overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 md:hidden">
      <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="sidebarOpen = false" />

      <div class="relative z-50 h-full w-64 border-r border-app-border bg-app-panel">
        <Sidebar />
      </div>
    </div>

    <!-- Main Content Area -->
    <div
      class="flex flex-1 flex-col overflow-hidden bg-app-bg"
      :class="{
        'md:ml-64': !$route.meta.fullWidth
      }"
    >
      <!-- Mobile Top Bar -->
      <div
        class="flex items-center gap-3 border-b border-app-border bg-app-panel px-4 py-2 md:hidden"
      >
        <button class="rounded-md p-1 hover:bg-app-hover" @click="sidebarOpen = true">
          <Menu class="h-6 w-6" />
        </button>

        <NuxtLink to="/" class="flex items-center gap-2">
          <Orbit class="h-6 w-6 text-emerald-600" />
          <span class="text-lg font-semibold text-app-text"> GO Launch Scall </span>
        </NuxtLink>
      </div>

      <!-- Main -->
      <main
        class="w-full min-w-0 flex-1 overflow-hidden pb-6 pt-2"
        :class="$route.meta.fullWidth ? 'px-0' : 'px-4 sm:px-5'"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
