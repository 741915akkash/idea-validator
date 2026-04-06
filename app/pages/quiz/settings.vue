<script setup>
  import { computed, onMounted, ref } from 'vue'
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
  const deletingIdea = ref(false)
  const showDeleteModal = ref(false)
  const deleteConfirmName = ref('')
  const deleteError = ref('')
  const currentQuiz = computed(() => quizStore.currentQuiz)
  const currentIdeaName = computed(() => String(currentQuiz.value?.name || 'Untitled idea'))
  const isDeleteConfirmationValid = computed(
    () => deleteConfirmName.value.trim() === currentIdeaName.value.trim()
  )

  onMounted(async () => {
    quizStore.hydrate()
    await quizStore.loadQuizzes()

    if (!quizStore.quizId && quizStore.quizzes.length) {
      quizStore.setQuizId(quizStore.quizzes[0].id)
      await quizStore.loadOverview(quizStore.quizId)
    }
  })

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

  async function deleteCurrentIdea() {
    if (!currentQuiz.value || deletingIdea.value) return

    deleteError.value = ''

    if (!isDeleteConfirmationValid.value) {
      deleteError.value = 'Type the exact idea name to confirm deletion.'
      return
    }

    deletingIdea.value = true

    try {
      const res = await $fetch('/api/quiz/delete', {
        method: 'POST',
        body: {
          quiz_id: currentQuiz.value.id,
          confirm_name: deleteConfirmName.value.trim()
        }
      })

      deleteConfirmName.value = ''
      showDeleteModal.value = false

      await quizStore.loadQuizzes()

      if (res?.next_quiz_id) {
        quizStore.setQuizId(res.next_quiz_id)
        await quizStore.loadOverview(res.next_quiz_id)
      } else {
        const fresh = await $fetch('/api/quiz/lifecycle/start?force=true', {
          method: 'POST'
        })
        quizStore.startFreshQuiz(fresh.quiz_id)
        await quizStore.loadQuizzes()
        await quizStore.loadOverview(fresh.quiz_id)
      }

      router.push('/quiz/overview')
    } catch (error) {
      deleteError.value = error?.statusMessage || 'Unable to delete idea'
    } finally {
      deletingIdea.value = false
    }
  }

  function openDeleteModal() {
    deleteConfirmName.value = ''
    deleteError.value = ''
    showDeleteModal.value = true
  }

  function closeDeleteModal() {
    if (deletingIdea.value) return
    showDeleteModal.value = false
    deleteConfirmName.value = ''
    deleteError.value = ''
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

      <div
        v-if="currentQuiz"
        class="mt-3 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3"
      >
        <span class="text-sm font-medium text-rose-800">Delete this idea</span>
        <button
          class="rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-60"
          :disabled="deletingIdea"
          @click="openDeleteModal"
        >
          Delete
        </button>
      </div>
    </div>

    <div
      v-if="showDeleteModal && currentQuiz"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-slate-900/50" @click="closeDeleteModal" />

      <div class="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
        <h2 class="text-lg font-semibold text-slate-900">Delete idea permanently</h2>
        <p class="mt-2 text-sm text-slate-600">
          Type <strong>{{ currentIdeaName }}</strong> to confirm deletion.
        </p>

        <div class="mt-4">
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Idea name
          </label>
          <input
            v-model="deleteConfirmName"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            :placeholder="currentIdeaName"
            autocomplete="off"
          />
        </div>

        <p v-if="deleteError" class="mt-2 text-sm text-rose-700">
          {{ deleteError }}
        </p>

        <div class="mt-5 flex items-center justify-end gap-2">
          <button
            class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            :disabled="deletingIdea"
            @click="closeDeleteModal"
          >
            Cancel
          </button>
          <button
            class="rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!isDeleteConfirmationValid || deletingIdea"
            @click="deleteCurrentIdea"
          >
            {{ deletingIdea ? 'Deleting...' : 'Delete idea' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
