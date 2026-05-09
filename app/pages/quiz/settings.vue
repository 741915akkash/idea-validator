<script setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useQuizSessionStore } from '~/stores/quizSession'
  import { useSourcesStore } from '~/stores/sources'
  import { crmFetch } from '~/composables/useCrmRequest'
  import SettingsBar from '../../components/settings/SettingsBar.vue'
  import BaseModal from '~/components/ui/BaseModal.vue'
  import Button2 from '../../components/ui/Button2.vue'

  definePageMeta({
    layout: 'app',
    middleware: 'auth'
  })

  const router = useRouter()
  const quizStore = useQuizSessionStore()
  const sourcesStore = useSourcesStore()

  const usersStore = useUsersStore()
  const user = useUser()
  const currentUser = computed(() => usersStore.currentUser)

  const loggingOut = ref(false)
  const deletingIdea = ref(false)
  const showDeleteModal = ref(false)
  const deleteConfirmName = ref('')
  const deleteError = ref('')
  const refreshingPlan = ref(false)

  const currentQuiz = computed(() => quizStore.currentQuiz)
  const currentIdeaName = computed(() => String(currentQuiz.value?.name || 'Untitled idea'))

  const showProfileModal = ref(false)
  const name = ref(user.value?.name || '')
  const profileError = ref('')
  const savingProfile = ref(false)
  const showSourcesModal = ref(false)
  const newSourceName = ref('')
  const sourcesError = ref('')
  const addingSource = ref(false)
  const deletingSourceId = ref('')

  const normalizedTier = computed(() =>
    String(user.value?.plan_tier || 'free')
      .trim()
      .toLowerCase()
  )

  const tierLabel = computed(() => {
    const tier = normalizedTier.value
    if (tier === 'growth') return 'Growth'
    if (tier === 'founder') return 'Founder'
    return 'Free'
  })

  const planStatusLabel = computed(() => {
    const status = String(user.value?.plan_status || '')
      .trim()
      .toLowerCase()
    if (!status) return null
    return status.charAt(0).toUpperCase() + status.slice(1)
  })

  const planExpiryLabel = computed(() => {
    const raw = user.value?.plan_expires_at
    if (!raw) return null
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString()
  })

  const isDeleteConfirmationValid = computed(
    () => deleteConfirmName.value.trim() === currentIdeaName.value.trim()
  )

  async function refreshPlan(force = true) {
    if (refreshingPlan.value) return
    refreshingPlan.value = true
    try {
      await bootstrapUser({ force })
    } finally {
      refreshingPlan.value = false
    }
  }

  function onWindowFocus() {
    refreshPlan(true)
  }

  async function updateProfile() {
    if (!name.value.trim()) {
      profileError.value = 'Name is required'
      return
    }

    savingProfile.value = true
    profileError.value = ''

    try {
      const updatedUser = await $fetch('/api/user/update', {
        method: 'PATCH',
        body: { name: name.value }
      })

      // update user (same pattern as logout uses user.value)
      user.value = { ...user.value, ...updatedUser }

      showProfileModal.value = false
    } catch (e) {
      profileError.value = e?.statusMessage || 'Failed to update profile'
    } finally {
      savingProfile.value = false
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      refreshPlan(true)
    }
  }

  onMounted(async () => {
    try {
      quizStore.hydrate()
      await quizStore.loadQuizzes()
      if (!quizStore.quizId && quizStore.quizzes.length) {
        quizStore.setQuizId(quizStore.quizzes[0].id)
      }

      // ✅ 1. Fetch users only if needed
      if (usersStore.users.length === 0) {
        const users = await crmFetch('/api/crm/users')
        usersStore.setUsers(users)
      }

      // ✅ 2. Sync current user
      const me = usersStore.users.find((u) => u.id === user.value?.id)
      if (me) usersStore.setCurrentUser(me)

      // ✅ 3. Other bootstraps
      if (sourcesStore.sources.length === 0) {
        try {
          const sources = await crmFetch('/api/crm/sources')
          sourcesStore.setSources(sources)
        } catch {
          sourcesStore.setSources([])
        }
      }

      await refreshPlan(true)
      // ✅ 4. Load default quiz overview when missing in-memory state
      if (quizStore.quizId && !quizStore.loaded) {
        await quizStore.loadOverview(quizStore.quizId)
      }

      // ✅ 5. Add listeners
      window.addEventListener('focus', onWindowFocus)
      document.addEventListener('visibilitychange', onVisibilityChange)
    } catch (e) {
      console.error('Init error:', e)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('focus', onWindowFocus)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  function logout() {
    if (loggingOut.value) return
    loggingOut.value = true

    // Optimistic navigation: move immediately, finish logout request in background.
    router.push('/general/signup-login')
    user.value = null
    quizStore.reset()

    $fetch('/api/auth/logout', { method: 'POST' })
      .catch((err) => {
        console.error('Logout request failed after navigation:', err)
      })
      .finally(() => {
        loggingOut.value = false
      })
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

  function openProfileModal() {
    name.value = currentUser.value?.name || ''
    profileError.value = ''
    showProfileModal.value = true
  }

  function closeProfileModal() {
    if (savingProfile.value) return
    showProfileModal.value = false
  }

  async function refreshSources() {
    const sources = await crmFetch('/api/crm/sources')
    sourcesStore.setSources(sources)
  }

  async function openSourcesModal() {
    showSourcesModal.value = true
    sourcesError.value = ''

    try {
      await refreshSources()
    } catch (error) {
      sourcesError.value = error?.statusMessage || 'Unable to load sources'
    }
  }

  function closeSourcesModal() {
    if (addingSource.value || Boolean(deletingSourceId.value)) return

    showSourcesModal.value = false
    newSourceName.value = ''
    sourcesError.value = ''
  }

  async function addSource() {
    const name = newSourceName.value.trim()
    if (!name || addingSource.value) return

    addingSource.value = true
    sourcesError.value = ''

    try {
      const created = await crmFetch('/api/crm/sources/create', {
        method: 'POST',
        body: { name }
      })

      const alreadyPresent = sourcesStore.sources.some((source) => source.id === created.id)
      if (!alreadyPresent) {
        sourcesStore.addSource(created)
      }
      newSourceName.value = ''
    } catch (error) {
      sourcesError.value = error?.statusMessage || 'Unable to add source'
    } finally {
      addingSource.value = false
    }
  }

  async function deleteSource(id) {
    if (!id || deletingSourceId.value) return

    deletingSourceId.value = id
    sourcesError.value = ''

    try {
      await crmFetch('/api/crm/sources/delete', {
        method: 'POST',
        body: { id }
      })

      sourcesStore.removeSource(id)
    } catch (error) {
      sourcesError.value = error?.statusMessage || 'Unable to delete source'
    } finally {
      deletingSourceId.value = ''
    }
  }
</script>

<template>
  <main class="px-6 py-6">
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-4 text-xl font-semibold text-slate-900">Settings</h1>

      <!-- ✅ Current Plan -->
      <SettingsBar title="Current plan" :subtitle="tierLabel">
        <div class="text-xs text-slate-500">
          <span v-if="planStatusLabel">Status: {{ planStatusLabel }}</span>
          <span v-if="planStatusLabel && planExpiryLabel"> • </span>
          <span v-if="planExpiryLabel">Renews/Expires: {{ planExpiryLabel }}</span>
        </div>
      </SettingsBar>

      <!-- Pricing -->
      <SettingsBar title="Pricing">
        <Button2 to="/general/pricing" variant="success" size="sm"> View plans </Button2>
      </SettingsBar>

      <!-- Usage -->
      <SettingsBar title="Usage">
        <Button2 to="/quiz/usage" variant="primary" size="sm"> View usage </Button2>
      </SettingsBar>

      <!-- Profile -->
      <SettingsBar
        title="Profile"
        :subtitle="
          currentUser?.name ? `${currentUser.name} • ${currentUser.email}` : currentUser?.email
        "
      >
        <Button2 size="sm" @click="openProfileModal"> Edit </Button2>
      </SettingsBar>

      <!-- Sources -->
      <SettingsBar title="Sources" :subtitle="`${sourcesStore.sources.length} source(s)`">
        <Button2 size="sm" @click="openSourcesModal"> Manage </Button2>
      </SettingsBar>

      <!-- Account -->
      <SettingsBar title="Account">
        <Button2 size="sm" :disabled="loggingOut" @click="logout">
          {{ loggingOut ? 'Logging out...' : 'Log out' }}
        </Button2>
      </SettingsBar>

      <!-- Delete -->
      <SettingsBar v-if="currentQuiz" title="Delete this idea" danger>
        <Button2 size="sm" variant="danger" @click="openDeleteModal"> Delete </Button2>
      </SettingsBar>
    </div>

    <!-- Modal unchanged -->
    <BaseModal v-model="showDeleteModal">
      <template #default="{ close }">
        <h2 class="text-lg font-semibold text-rose-700">Delete this idea?</h2>

        <p class="mt-2 text-sm text-slate-600">
          This action cannot be undone. Type <strong>{{ currentIdeaName }}</strong> to confirm.
        </p>

        <div class="mt-4">
          <input
            v-model="deleteConfirmName"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Type idea name"
          />
        </div>

        <p v-if="deleteError" class="mt-2 text-sm text-rose-700">
          {{ deleteError }}
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <Button2 class="rounded-md border px-4 py-2 text-sm" @click="close">Cancel</Button2>

          <Button2
            class="rounded-md bg-rose-700 px-4 py-2 text-sm text-white disabled:opacity-60"
            :disabled="deletingIdea"
            @click="deleteCurrentIdea"
          >
            {{ deletingIdea ? 'Deleting...' : 'Delete' }}
          </Button2>
        </div>
      </template>
    </BaseModal>

    <BaseModal v-model="showProfileModal">
      <template #default="{ close }">
        <h2 class="text-lg font-semibold text-slate-900">Update Profile</h2>

        <p class="mt-2 text-sm text-slate-600">Update your personal details.</p>

        <!-- Name -->
        <div class="mt-4">
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Full Name
          </label>
          <input
            v-model="name"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Your name"
          />
        </div>

        <!-- Email -->
        <div class="mt-3">
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Email
          </label>
          <input
            :value="currentUser?.email"
            disabled
            class="w-full rounded-md border border-slate-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
        </div>

        <!-- Error -->
        <p v-if="profileError" class="mt-2 text-sm text-rose-700">
          {{ profileError }}
        </p>

        <!-- Actions -->
        <div class="mt-5 flex justify-end gap-2">
          <Button2 @click="close"> Cancel </Button2>

          <Button2 variant="success" :disabled="savingProfile" @click="updateProfile">
            {{ savingProfile ? 'Saving...' : 'Save changes' }}
          </Button2>
        </div>
      </template>
    </BaseModal>

    <BaseModal v-model="showSourcesModal">
      <template #default="{ close }">
        <h2 class="text-lg font-semibold text-rose-700">Manage sources</h2>

        <p class="mt-2 text-sm text-slate-600">
          Add or delete lead sources. Changes apply to your account only.
        </p>

        <div class="mt-4">
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Add new source
          </label>
          <div class="flex gap-2">
            <input
              v-model="newSourceName"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. LinkedIn, Referral"
              @keyup.enter="addSource"
            />
            <Button2
              variant="success"
              :disabled="addingSource || !newSourceName.trim()"
              @click="addSource"
            >
              {{ addingSource ? 'Adding...' : 'Add' }}
            </Button2>
          </div>
        </div>

        <div class="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
          <div
            v-for="source in sourcesStore.sources"
            :key="source.id"
            class="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
          >
            <span class="text-sm text-slate-700">{{ source.name }}</span>
            <Button2
              size="sm"
              variant="danger"
              :disabled="deletingSourceId === source.id"
              @click="deleteSource(source.id)"
            >
              {{ deletingSourceId === source.id ? 'Deleting...' : 'Delete' }}
            </Button2>
          </div>
          <p v-if="sourcesStore.sources.length === 0" class="text-sm text-slate-500">
            No sources yet. Add your first source above.
          </p>
        </div>

        <p v-if="sourcesError" class="mt-2 text-sm text-rose-700">
          {{ sourcesError }}
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <Button2 class="rounded-md border px-4 py-2 text-sm" @click="closeSourcesModal(); close()">
            Close
          </Button2>
        </div>
      </template>
    </BaseModal>
  </main>
</template>
