<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const progress = ref(0)

  const updateProgress = () => {
    const scrollTop = window.scrollY
    const docHeight = document.body.scrollHeight - window.innerHeight

    progress.value = (scrollTop / docHeight) * 100
  }

  onMounted(() => {
    window.addEventListener('scroll', updateProgress)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateProgress)
  })
</script>

<template>
  <div class="fixed left-0 top-0 z-50 h-1 w-full bg-gray-200">
    <div class="h-1 bg-black transition-all" :style="{ width: progress + '%' }"></div>
  </div>
</template>
