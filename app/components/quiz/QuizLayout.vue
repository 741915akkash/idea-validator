<template>
  <div class="min-h-screen grid grid-cols-12">
    <aside class="col-span-3 border-r p-4">
      <slot name="sidebar" />
    </aside>

    <main class="col-span-9 p-8">
      <slot name="main" />
    </main>
  </div>
</template>
