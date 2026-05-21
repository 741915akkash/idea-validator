<script setup>
  import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { MessageSquare, User, Plus, Filter } from 'lucide-vue-next'

  import FilterSidebar from './FilterSidebar.vue'
  import SearchBar from './SearchBar.vue'
  import NotesFeed from './NotesFeed/NotesFeed.vue'
  import SearchResults from './SearchResults.vue'
  import QuickCapture from './QuickCapture.vue'
  import NoteDetailsDrawer from './NotesFeed/NoteDetailsDrawer.vue'

  import { useQuizSessionStore } from '~/stores/quizSession'
  import { useSearchStore } from '~/stores/search'

  const quizStore = useQuizSessionStore()
  const searchStore = useSearchStore()
  const route = useRoute()

  const searchQuery = ref('')
  const showQuickCapture = ref(false)
  const activeScope = ref('ALL')
  const isSidebarOpen = ref(false)

  const selectedNote = ref(null)

  const openNote = (note) => {
    selectedNote.value = note
    console.log('Opening note:', note)
  }

  const scopes = ['ALL', 'Notes', 'Interviews', 'CRM']

  const isSearchPinnedByScroll = ref(false)
  const feedScrollRef = ref(null)

  const isSearchActive = computed(() => {
    return searchQuery.value.length > 0 || searchStore.isSearchOpen
  })

  const shouldPinSearch = computed(() => {
    return isSearchPinnedByScroll.value || isSearchActive.value
  })

  const notes = ref([])
  const currentQuizId = ref(null)

  const resolveQuizId = async () => {
    quizStore.hydrate()
    const routeQuizId = String(route.query?.quiz_id || '').trim() || null

    if (routeQuizId) {
      if (quizStore.quizId !== routeQuizId) {
        quizStore.setQuizId(routeQuizId)
      }
      return routeQuizId
    }

    if (quizStore.quizId) {
      return quizStore.quizId
    }

    await quizStore.loadQuizzes()
    if (quizStore.quizzes.length) {
      const firstQuizId = quizStore.quizzes[0].id
      quizStore.setQuizId(firstQuizId)
      return firstQuizId
    }

    return null
  }

  const fetchNotes = async () => {
    try {
      const quizId = await resolveQuizId()

      if (!quizId) return
      currentQuizId.value = quizId

      const response = await $fetch('/api/knowledge-base/notes', {
        query: {
          quizId
        }
      })

      console.log('Fetched notes:', response)

      const rows = Array.isArray(response) ? response : response?.notes || []

      notes.value =
        rows.map((note) => ({
          id: note.question_id ? `${note.quiz_id}-${note.question_id}` : note.id,
          title:
            note.source === 'question_note'
              ? note.title || `Question ${note.question_id}`
              : note.title || '',
          checkpoint: note.checkpoint ? `Checkpoint ${note.checkpoint}` : 'Quick Capture',
          content: note.content,
          tags: note.tags || [],
          created_at: note.created_at,
          type: 'Notes'
        })) || []
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }

  watch(isSearchActive, async (active) => {
    if (active) {
      await nextTick()

      headerRef.value?.focusInput?.()
    }
  })

  watch(
    () => searchStore.isSearchOpen,
    async (open) => {
      if (open) {
        await nextTick()

        headerRef.value?.focusInput?.()
      }
    }
  )

  let searchTimeout = null

  watch(searchQuery, (val) => {
    if (!val) {
      searchResults.value = []

      clearTimeout(searchTimeout)
      return
    }

    clearTimeout(searchTimeout)

    searchTimeout = setTimeout(() => {
      fetchSearchResults()
    }, 250)
  })

  watch(isSearchActive, (active) => {
    if (!active) {
      isSidebarOpen.value = false
    }
  })

  const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches
  const pushedSearchHistory = ref(false)

  watch(isSearchActive, (active) => {
    if (!isMobileViewport()) return

    if (active && !pushedSearchHistory.value) {
      window.history.pushState({ kbSearchMode: true }, '')
      pushedSearchHistory.value = true
      return
    }

    if (!active) {
      pushedSearchHistory.value = false
    }
  })

  watch(
    () => !!selectedNote.value || isSidebarOpen.value,
    (open) => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      const shouldLockBody = isMobile && open
      document.body.style.overflow = shouldLockBody ? 'hidden' : ''
      document.body.style.touchAction = shouldLockBody ? 'none' : ''
    }
  )

  onMounted(async () => {
    await fetchNotes()
    window.addEventListener('keydown', handleEscape)
    window.addEventListener('popstate', handleMobileBack)
    window.addEventListener('kb:open-quick-capture', handleQuickCaptureShortcut)
    if (sessionStorage.getItem('kb_open_quick_capture') === '1') {
      sessionStorage.removeItem('kb_open_quick_capture')
      handleQuickCaptureShortcut()
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape)
    window.removeEventListener('popstate', handleMobileBack)
    window.removeEventListener('kb:open-quick-capture', handleQuickCaptureShortcut)
  })

  const handleFeedScroll = (event) => {
    const scrollTop = event?.target?.scrollTop || 0
    isSearchPinnedByScroll.value = scrollTop > 140
  }

  const searchResults = ref([])
  const isSearching = ref(false)

  const fetchSearchResults = async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }

    try {
      isSearching.value = true

      const response = await $fetch('/api/knowledge-base/search', {
        query: {
          query: searchQuery.value,
          quizId: currentQuizId.value || (await resolveQuizId())
        }
      })

      console.log('Search response:', response)
      const categories = Array.isArray(response?.results) ? response.results : []
      searchResults.value = categories.flatMap((group) =>
        Array.isArray(group?.items) ? group.items : []
      )
    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  const activeFilters = ref({
    checkpoints: [],
    types: [],
    dateRanges: [],
    questionTypes: [],
    status: []
  })

  const toggleFilter = (group, value) => {
    const current = activeFilters.value[group]

    if (current.includes(value)) {
      activeFilters.value[group] = current.filter((v) => v !== value)
    } else {
      activeFilters.value[group].push(value)
    }
  }

  const filteredNotes = computed(() => {
    const useServerSearch = !!searchQuery.value?.trim()
    let result = [...(useServerSearch ? searchResults.value : notes.value)]
    const normalize = (value) => String(value || '').trim().toLowerCase()

    // SEARCH (fallback local filtering when server search not active)
    if (!useServerSearch && searchQuery.value?.trim()) {
      const query = searchQuery.value.toLowerCase()

      result = result.filter((note) => {
        return (
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.checkpoint?.toLowerCase().includes(query) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(query))
        )
      })
    }

    // SEARCH SCOPE / CONTENT TYPE
    if (activeScope.value && !['all', 'ALL'].includes(activeScope.value)) {
      result = result.filter((note) => note.type?.toLowerCase() === activeScope.value.toLowerCase())
    }

    // CHECKPOINTS
    if (activeFilters.value.checkpoints.length) {
      const selectedCheckpoints = activeFilters.value.checkpoints.map(normalize)
      result = result.filter((note) => selectedCheckpoints.includes(normalize(note.checkpoint)))
    }

    return result
  })

  const filterGroups = ref([
    {
      key: 'checkpoints',
      name: 'Checkpoints',
      isOpen: true,
      items: [
        'Checkpoint 1',
        'Checkpoint 2',
        'Checkpoint 3',
        'Checkpoint 4',
        'Checkpoint 5',
        'Checkpoint 6',
        'Checkpoint 7',
        'Checkpoint 8',
        'Checkpoint 9'
      ]
    }
  ])

  const toggleGroup = (groupName) => {
    const group = filterGroups.value.find((g) => g.name === groupName)

    if (group) {
      group.isOpen = !group.isOpen
    }
  }

  // quick capture save
  const saveQuickCapture = async (note) => {
    try {
      const quizId = currentQuizId.value || (await resolveQuizId())

      if (!quizId) {
        throw new Error('No quiz selected')
      }

      await $fetch('/api/knowledge-base/quick-capture', {
        method: 'POST',
        body: {
          quizId,
          title: note?.title || '',
          content: note?.content || '',
          tags: Array.isArray(note?.tags) ? note.tags : []
        }
      })

      await fetchNotes()
      showQuickCapture.value = false
    } catch (error) {
      console.error('Failed to save quick capture:', error)
    }
  }

  const headerRef = ref(null)

  defineEmits(['open-quick-capture'])

  defineExpose({
    focusSearch: () => headerRef.value?.focusSearch()
  })

  // mobile drawer swipe handling
  const touchStartY = ref(0)
  const touchEndY = ref(0)

  const handleTouchStart = (e) => {
    touchStartY.value = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    touchEndY.value = e.touches[0].clientY
  }

  const handleDrawerClose = () => {
    const distance = touchEndY.value - touchStartY.value

    if (distance > 120) {
      selectedNote.value = null
    }
  }

  const handleFilterClose = () => {
    const distance = touchEndY.value - touchStartY.value

    if (distance > 120) {
      isSidebarOpen.value = false
    }
  }

  const resetSearchMode = () => {
    searchQuery.value = ''
    activeScope.value = 'ALL'
    searchStore.isSearchOpen = false
    isSidebarOpen.value = false
    isSearchPinnedByScroll.value = false
  }

  const handleEscape = (e) => {
    if (e.key !== 'Escape') return
    if (!isSearchActive.value) return
    resetSearchMode()
  }

  const handleMobileBack = () => {
    if (!isMobileViewport()) return
    if (!isSearchActive.value) return
    resetSearchMode()
    pushedSearchHistory.value = false
  }

  const handleQuickCaptureShortcut = () => {
    showQuickCapture.value = true
  }

</script>

<template>
  <div class="flex h-full w-full overflow-hidden px-6 py-6">
    <!-- DESKTOP / TABLET SIDEBAR -->
    <div class="hidden pt-[172px] md:block">
      <FilterSidebar
        :filterGroups="filterGroups"
        :activeFilters="activeFilters"
        @toggle-group="toggleGroup"
        @toggle-filter="toggleFilter"
        :is-open="isSidebarOpen"
        @close="isSidebarOpen = false"
      />
    </div>

    <!-- ROOT PAGE LAYOUT -->
    <div
      class="grid h-full w-full flex-1 grid-cols-1 gap-2 overflow-hidden md:grid-cols-[minmax(0,1fr)_clamp(280px,28vw,380px)]"
    >
      <!-- LEFT MAIN AREA -->
      <div class="min-w-0 overflow-hidden">
        <!-- CENTERED CONTENT -->
        <div class="ml-auto mr-4 flex h-full w-full max-w-4xl flex-col overflow-hidden max-xl:max-w-none">
          <!-- NORMAL BROWSE MODE -->
          <div
            v-if="!isSearchActive"
            ref="feedScrollRef"
            class="custom-scrollbar h-full overflow-y-auto"
            @scroll="handleFeedScroll"
          >
            <!-- HEADER CARD -->
            <div class="mb-6 rounded-lg border border-slate-200 bg-white px-6 py-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
                    Knowledge Base
                  </h1>

                  <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
                </div>

                <button
                  @click="showQuickCapture = true"
                  class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Plus class="h-5 w-5" />
                  Quick Capture (CTRL + Q)
                </button>
              </div>
            </div>

            <!-- SEARCH -->
            <div
              class="mb-6"
              :class="
                shouldPinSearch
                  ? 'fixed left-[max(17rem,calc(50%-28rem))] right-[404px] top-6 z-30 max-w-5xl transition-all duration-200 max-md:left-4 max-md:right-4'
                  : 'w-full'
              "
            >
              <div
                class="rounded-2xl border border-slate-200 bg-gray-100 px-3 py-2 shadow-sm backdrop-blur-md"
              >
                <SearchBar
                  ref="headerRef"
                  v-model:searchQuery="searchQuery"
                  v-model:activeScope="activeScope"
                  :scopes="scopes"
                />
              </div>
            </div>

            <!-- CONTENT -->
            <div :class="shouldPinSearch ? 'pt-24' : 'pt-5'">
              <NotesFeed :notes="notes" @open="openNote" />
            </div>
          </div>

          <!-- SEARCH MODE -->
          <div
            v-else
            ref="feedScrollRef"
            class="custom-scrollbar h-full overflow-y-auto"
            @scroll="handleFeedScroll"
          >
            <!-- PINNED SEARCH -->
            <div
              class="fixed left-[max(17rem,calc(50%-28rem))] right-[404px] top-4 z-30 max-w-5xl transition-all duration-200 max-md:left-4 max-md:right-4"
            >
              <div
                class="rounded-3xl border border-slate-200 bg-gray-100 px-3 py-2 shadow-sm backdrop-blur-md"
              >
                <div class="flex items-center gap-3">
                  <!-- FILTER -->
                  <button
                    @click="isSidebarOpen = !isSidebarOpen"
                    class="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-700"
                  >
                    <Filter class="h-4 w-4" />
                    <span class="hidden md:inline"> Filters </span>
                  </button>

                  <!-- SEARCH -->
                  <div class="min-w-0 flex-1">
                    <SearchBar
                      ref="headerRef"
                      v-model:searchQuery="searchQuery"
                      v-model:activeScope="activeScope"
                      :scopes="scopes"
                    />
                    <p class="mt-2 hidden text-xs text-slate-500 md:block">
                      Hint: Press <kbd class="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px]">Esc</kbd>
                      to return to normal mode.
                    </p>
                    <p class="mt-2 text-xs text-slate-500 md:hidden">
                      Hint: Use your phone back button to clear search and return to normal mode.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- RESULTS -->
            <div
              class="min-w-0 pt-32 transition-all duration-200"
              :class="isSidebarOpen ? 'pl-7' : ''"
            >
              <SearchResults
                :items="filteredNotes"
                :searchQuery="searchQuery"
                @open="selectedNote = $event"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT DRAWER AREA -->
      <div class="relative hidden h-full bg-white md:block">
        <div class="fixed right-0 top-0 flex h-screen w-[clamp(280px,28vw,380px)] items-center p-6">
          <NoteDetailsDrawer
            :note="selectedNote"
            :isOpen="!!selectedNote"
            @close="selectedNote = null"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- MOBILE DRAWER -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="selectedNote"
        class="fixed inset-0 z-[90] flex items-end bg-black/40 backdrop-blur-sm lg:hidden"
        @click.self="selectedNote = null"
      >
        <div
          class="max-h-[92vh] w-full overflow-hidden overscroll-contain rounded-t-[28px] bg-white"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleDrawerClose"
        >
          <!-- HANDLE -->
          <div class="flex justify-center py-3">
            <div class="h-1.5 w-14 rounded-full bg-slate-200"></div>
          </div>

          <NoteDetailsDrawer
            :note="selectedNote"
            :isOpen="!!selectedNote"
            @close="selectedNote = null"
          />
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- MOBILE FILTERS -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-[95] flex items-end bg-black/40 backdrop-blur-sm md:hidden"
        @click.self="isSidebarOpen = false"
      >
        <div
          class="max-h-[88vh] w-full overflow-hidden overscroll-contain rounded-t-[28px] bg-white"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleFilterClose"
        >
          <!-- HANDLE -->
          <div class="flex justify-center py-3">
            <div class="h-1.5 w-14 rounded-full bg-slate-200"></div>
          </div>

          <!-- HEADER -->
          <div class="border-b border-slate-100 px-5 pb-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-slate-900">Filters</h2>

              <button
                @click="isSidebarOpen = false"
                class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- CONTENT -->
          <div class="max-h-[70vh] overflow-y-auto overscroll-contain p-5">
            <FilterSidebar
              :filterGroups="filterGroups"
              :activeFilters="activeFilters"
              @toggle-group="toggleGroup"
              @toggle-filter="toggleFilter"
              :is-open="true"
              @close="isSidebarOpen = false"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- QUICK CAPTURE MODAL -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showQuickCapture"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click.self="showQuickCapture = false"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-4 scale-95 opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-4 scale-95 opacity-0"
        >
          <div class="w-full max-w-[520px]">
            <QuickCapture @close="showQuickCapture = false" @save="saveQuickCapture" />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
