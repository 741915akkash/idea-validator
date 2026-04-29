<!-- /app/layouts/docs.vue -->
<template>
  <div class="flex h-screen bg-white text-gray-800">
    <!-- LEFT SIDEBAR -->
    <aside class="w-64 overflow-y-auto border-r border-gray-200 p-4">
      <DocsSidebar />
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 overflow-y-auto px-10 py-8">
      <slot />
    </main>

    <!-- RIGHT TOC -->
    <aside class="w-64 overflow-y-auto border-l border-gray-200 p-4">
      <DocsTOC />
    </aside>
  </div>
</template>
