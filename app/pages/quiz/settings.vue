<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const router = useRouter()
  const quizStore = useQuizSessionStore()
  const user = useUser()
  const loggingOut = ref(false)

  async function logout() {
    if (loggingOut.value) return
    loggingOut.value = true

    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      quizStore.reset()
      loggingOut.value = false
      router.push('/signup-login')
    }
  }
</script>

<template>
  <main class="px-6 py-6">
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-4 text-xl font-semibold text-slate-900">Settings</h1>

      <div class="mb-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <span class="text-sm font-medium text-slate-700">Pricing</span>
        <NuxtLink
          to="/pricing"
          class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          View plans
        </NuxtLink>
      </div>

      <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <span class="text-sm font-medium text-slate-700">Account</span>
        <button
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          :disabled="loggingOut"
          @click="logout"
        >
          {{ loggingOut ? 'Logging out...' : 'Log out' }}
        </button>
      </div>
    </div>
  </main>
</template>
