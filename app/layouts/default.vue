<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b">
      <div class="max-w-6xl mx-auto px-4 py-4 font-semibold">
        Idea Validator
      </div>
    </header>

    <main class="flex-1">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <slot />
      </div>
    </main>

    <footer class="border-t">
      <div class="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-500">
        © 2025
      </div>
    </footer>
  </div>
</template>
