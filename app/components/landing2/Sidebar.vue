<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import {
    Target,
    LayoutDashboard,
    Rocket,
    BookOpen,
    MessagesSquare,
    Columns3,
    Settings
  } from 'lucide-vue-next'
  import IdeaSelector from '~/components/landing2/sidebar/IdeaSelector.vue'
  import SidebarModals from '~/components/landing2/sidebar/SidebarModals.vue'
  import { useQuizSessionStore } from '~/stores/quizSession'

  const props = defineProps({
    showBrand: {
      type: Boolean,
      default: true
    }
  })

  const quizStore = useQuizSessionStore()
  const route = useRoute()

  const isClientReady = ref(false)
  const isArchiving = ref(false)
  const isUnarchiving = ref(false)
  const isRenaming = ref(false)
  const showIdeaActionsMenu = ref(false)
  const showRenameModal = ref(false)
  const showArchiveConfirmModal = ref(false)
  const showArchivedIdeasModal = ref(false)
  const renameDraft = ref('')
  const archiveTargetIdea = ref(null)
  const quizzes = computed(() => quizStore.quizzes)
  const rootIdeas = computed(() =>
    quizzes.value.filter((q) => Number(q.revision_number ?? 0) === 0)
  )
  const activeRootIdeas = computed(() => rootIdeas.value.filter((q) => !q.archived_at))
  const archivedRootIdeas = computed(() => rootIdeas.value.filter((q) => !!q.archived_at))
  const hasArchivedIdeas = computed(() => archivedRootIdeas.value.length > 0)
  const currentQuiz = computed(() => quizzes.value.find((q) => q.id === quizStore.quizId) || null)
  const activeIdea = computed(() => {
    if (!currentQuiz.value) return rootIdeas.value.find((q) => q.id === quizStore.quizId) || null
    if (!currentQuiz.value.parent_quiz_id) return currentQuiz.value
    return quizzes.value.find((q) => q.id === currentQuiz.value.parent_quiz_id) || currentQuiz.value
  })

  onMounted(async () => {
    quizStore.hydrate()
    isClientReady.value = true

    try {
      await quizStore.loadQuizzes()
    } catch {
      quizStore.quizzes = []
    }
  })

  function latestQuizIdForIdeaRoot(rootId) {
    if (!rootId) return null

    const family = quizzes.value.filter((q) => String(q.parent_quiz_id || q.id) === String(rootId))
    if (!family.length) return null

    const latest = family.reduce((best, q) => {
      return Number(q.revision_number ?? 0) > Number(best.revision_number ?? 0) ? q : best
    }, family[0])

    return latest?.id || null
  }

  function closeIdeaActionsMenu() {
    showIdeaActionsMenu.value = false
  }

  function toggleIdeaActionsMenu() {
    if (!activeIdea.value && !hasArchivedIdeas.value) return
    showIdeaActionsMenu.value = !showIdeaActionsMenu.value
  }

  async function switchQuiz(id) {
    if (!id) return

    const targetId = latestQuizIdForIdeaRoot(id) || id
    if (targetId === quizStore.quizId) return

    closeIdeaActionsMenu()
    showArchivedIdeasModal.value = false
    quizStore.loaded = false
    quizStore.setQuizId(targetId)
    await quizStore.loadOverview(targetId)

    if (!route.path.startsWith('/quiz/overview')) {
      navigateTo('/quiz/overview')
    }
  }

  async function startNewQuiz() {
    closeIdeaActionsMenu()
    const res = await $fetch('/api/quiz/lifecycle/start?force=true', {
      method: 'POST'
    })

    quizStore.startFreshQuiz(res.quiz_id)
    await quizStore.loadQuizzes()
    await quizStore.loadOverview(res.quiz_id)

    navigateTo('/quiz/overview')
  }

  function archiveCurrentQuiz() {
    if (!activeIdea.value || isArchiving.value) return
    closeIdeaActionsMenu()
    archiveTargetIdea.value = activeIdea.value
    showArchiveConfirmModal.value = true
  }

  function closeArchiveConfirmModal() {
    if (isArchiving.value) return
    showArchiveConfirmModal.value = false
    archiveTargetIdea.value = null
  }

  async function confirmArchiveCurrentQuiz() {
    const targetQuiz = archiveTargetIdea.value
    if (!targetQuiz || isArchiving.value) return

    isArchiving.value = true

    try {
      const res = await $fetch('/api/quiz/archive', {
        method: 'POST',
        body: { quiz_id: targetQuiz.id }
      })

      quizStore.removeQuiz(targetQuiz.id)

      if (res?.next_quiz_id) {
        quizStore.setQuizId(res.next_quiz_id)
        await quizStore.loadOverview(res.next_quiz_id)
      } else {
        const fresh = await $fetch('/api/quiz/lifecycle/start?force=true', {
          method: 'POST'
        })
        quizStore.startFreshQuiz(fresh.quiz_id)
        await quizStore.loadOverview(fresh.quiz_id)
      }

      await quizStore.loadQuizzes()
      closeArchiveConfirmModal()
      navigateTo('/quiz/overview')
    } finally {
      isArchiving.value = false
    }
  }

  async function unarchiveCurrentQuiz() {
    if (!activeIdea.value || !activeIdea.value.archived_at || isUnarchiving.value) return

    closeIdeaActionsMenu()
    isUnarchiving.value = true

    try {
      await $fetch('/api/quiz/unarchive', {
        method: 'POST',
        body: { quiz_id: activeIdea.value.id }
      })

      await quizStore.loadQuizzes()
      showArchivedIdeasModal.value = false
      await quizStore.loadOverview(quizStore.quizId)

      if (!route.path.startsWith('/quiz/overview')) {
        navigateTo('/quiz/overview')
      }
    } finally {
      isUnarchiving.value = false
    }
  }

  function openArchivedIdeas() {
    closeIdeaActionsMenu()
    showArchivedIdeasModal.value = true
  }

  function closeArchivedIdeasModal() {
    showArchivedIdeasModal.value = false
  }

  async function renameCurrentQuiz() {
    if (!activeIdea.value) return
    closeIdeaActionsMenu()

    renameDraft.value = activeIdea.value.name || 'Untitled idea'
    showRenameModal.value = true
  }

  function closeRenameModal() {
    if (isRenaming.value) return
    showRenameModal.value = false
  }

  async function saveRenameFromModal() {
    if (!activeIdea.value || isRenaming.value) return

    const trimmed = renameDraft.value.trim()
    if (!trimmed) return

    isRenaming.value = true

    try {
      await $fetch('/api/quiz/rename-quiz', {
        method: 'POST',
        body: {
          quiz_id: activeIdea.value.id,
          name: trimmed
        }
      })

      quizStore.renameQuiz(activeIdea.value.id, trimmed)
      showRenameModal.value = false
    } finally {
      isRenaming.value = false
    }
  }

  /* Active route detection */

  const isOverview = computed(() => route.path.startsWith('/quiz/overview'))

  const isInterviews = computed(() => route.path.startsWith('/quiz/interviews'))
  const isSettings = computed(() => route.path.startsWith('/quiz/settings'))

  const isHowItWorks = computed(() => route.path.startsWith('/how-it-works'))
  const interviewsLink = computed(() =>
    isClientReady.value && quizStore.quizId
      ? `/quiz/interviews?quiz_id=${quizStore.quizId}`
      : '/quiz/interviews'
  )
  const masterDetailLink = computed(() =>
    isClientReady.value && quizStore.quizId
      ? `/quiz/master-detail?quiz_id=${quizStore.quizId}`
      : '/quiz/master-detail'
  )
</script>

<template>
  <nav class="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 pb-6 pt-10">
    <!-- Logo -->
    <NuxtLink v-if="props.showBrand" to="/" class="flex items-center gap-2">
      <Target class="h-6 w-6 text-emerald-600 md:h-8 md:w-8" />
      <span class="text-lg font-semibold text-slate-900 md:text-xl">
        Idea Validator
      </span>
    </NuxtLink>

    <IdeaSelector
      :is-client-ready="isClientReady"
      :active-idea="activeIdea"
      :active-root-ideas="activeRootIdeas"
      :has-archived-ideas="hasArchivedIdeas"
      :show-idea-actions-menu="showIdeaActionsMenu"
      :is-unarchiving="isUnarchiving"
      :is-renaming="isRenaming"
      :is-archiving="isArchiving"
      @switch-quiz="switchQuiz"
      @toggle-idea-actions-menu="toggleIdeaActionsMenu"
      @open-archived-ideas="openArchivedIdeas"
      @unarchive-current-quiz="unarchiveCurrentQuiz"
      @rename-current-quiz="renameCurrentQuiz"
      @archive-current-quiz="archiveCurrentQuiz"
      @close-idea-actions-menu="closeIdeaActionsMenu"
    />

    <!-- MAIN SECTION -->
    <div class="mt-8">
      <div class="mb-2 text-xs uppercase text-neutral-500">Main</div>

      <div class="flex flex-col gap-1 text-sm">
        <!-- Overview -->
        <NuxtLink
          to="/quiz/overview"
          class="flex items-center gap-2 rounded-lg px-3 py-2 transition"
          :class="
            isOverview
              ? 'bg-emerald-50 font-medium text-emerald-700'
              : 'text-slate-700 hover:bg-slate-100'
          "
        >
          <LayoutDashboard class="h-4 w-4" />
          Overview
        </NuxtLink>

        <NuxtLink
          :to="interviewsLink"
          class="flex items-center gap-2 rounded-lg px-3 py-2 transition"
          :class="
            isInterviews
              ? 'bg-emerald-50 font-medium text-emerald-700'
              : 'text-slate-700 hover:bg-slate-100'
          "
        >
          <MessagesSquare class="h-4 w-4" />
          Interviews
        </NuxtLink>

        <!-- Master Detail -->
        <NuxtLink
          :to="masterDetailLink"
          class="flex items-center gap-2 rounded-lg px-3 py-2 transition"
          :class="
            route.path.startsWith('/quiz/master-detail')
              ? 'bg-emerald-50 font-medium text-emerald-700'
              : 'text-slate-700 hover:bg-slate-100'
          "
        >
          <Columns3 class="h-4 w-4" />
          Master Detail
        </NuxtLink>
      </div>
    </div>

    <!-- PRIMARY CTA -->
    <div class="mt-6">
      <NuxtLink
        v-if="isClientReady && quizStore.hasQuiz"
        to="/quiz"
        class="block w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-700"
      >
        Continue
      </NuxtLink>

      <NuxtLink
        v-else
        to="/signup-login"
        class="block w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-700"
      >
        Start Validating
      </NuxtLink>
    </div>

    <div class="mt-6">
      <div class="mb-2 text-xs uppercase text-neutral-500">Action</div>

      <button
        @click="startNewQuiz"
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
      >
        <Rocket class="h-4 w-4" />
        + New Idea
      </button>
    </div>

    <!-- LEARN SECTION -->
    <div class="mt-6">
      <div class="mb-2 text-xs uppercase text-neutral-500">Learn</div>

      <NuxtLink
        to="/how-it-works"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
        :class="
          isHowItWorks
            ? 'bg-emerald-50 font-medium text-emerald-700'
            : 'text-slate-700 hover:bg-slate-100'
        "
      >
        <BookOpen class="h-4 w-4" />
        How it works
      </NuxtLink>
    </div>

    <div class="mt-auto pt-6">
      <div class="mb-2 text-xs uppercase text-neutral-500">System</div>
      <NuxtLink
        to="/quiz/settings"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
        :class="
          isSettings
            ? 'bg-emerald-50 font-medium text-emerald-700'
            : 'text-slate-700 hover:bg-slate-100'
        "
      >
        <Settings class="h-4 w-4" />
        Settings
      </NuxtLink>
    </div>

    <SidebarModals
      :show-archive-confirm-modal="showArchiveConfirmModal"
      :show-rename-modal="showRenameModal"
      :show-archived-ideas-modal="showArchivedIdeasModal"
      :archive-idea-name="archiveTargetIdea?.name || ''"
      :is-archiving="isArchiving"
      :is-renaming="isRenaming"
      :rename-draft="renameDraft"
      :archived-root-ideas="archivedRootIdeas"
      @close-archive-confirm="closeArchiveConfirmModal"
      @confirm-archive="confirmArchiveCurrentQuiz"
      @close-rename="closeRenameModal"
      @save-rename="saveRenameFromModal"
      @update:rename-draft="renameDraft = $event"
      @close-archived-ideas="closeArchivedIdeasModal"
      @select-archived-idea="switchQuiz"
    />
  </nav>
</template>
