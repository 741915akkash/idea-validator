<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const progress = ref(0)

  const updateProgress = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight

    progress.value = (scrollTop / docHeight) * 100
  }

  onMounted(() => {
    window.addEventListener('scroll', updateProgress)
    updateProgress() // Initial check
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateProgress)
  })
</script>

<template>
  <div class="fixed left-0 top-0 z-50 h-1.5 w-full bg-emerald-500/10">
    <div
      class="h-1.5 bg-emerald-800 transition-all duration-150"
      :style="{ width: progress + '%' }"
    ></div>
  </div>
</template>
