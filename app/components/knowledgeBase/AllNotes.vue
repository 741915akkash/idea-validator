<script setup>
  import { ref, onMounted, computed, nextTick, watch } from 'vue'
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

  const searchQuery = ref('')
  const showQuickCapture = ref(false)
  const activeScope = ref('ALL')
  const isSidebarOpen = ref(false)

  const selectedNote = ref(null)

  const openNote = (note) => {
    selectedNote.value = note
  }

  const scopes = ['ALL', 'Notes', 'Interviews', 'CRM']

  const isSearchPinnedByScroll = ref(false)

  const isSearchActive = computed(() => {
    return searchQuery.value.length > 0 || searchStore.isSearchOpen
  })

  const shouldPinSearch = computed(() => {
    return isSearchPinnedByScroll.value || isSearchActive.value
  })

  const notes = ref([])

  const fetchNotes = async () => {
    try {
      quizStore.hydrate()

      let quizId = quizStore.quizId

      if (!quizId) {
        await quizStore.loadQuizzes()

        if (quizStore.quizzes.length) {
          quizId = quizStore.quizzes[0].id
          quizStore.setQuizId(quizId)
        }
      }

      if (!quizId) return

      const response = await $fetch('/api/knowledge-base/notes', {
        query: {
          quizId
        }
      })

      console.log('Fetched notes:', response)

      notes.value =
        response.notes?.map((note) => ({
          id: `${note.quiz_id}-${note.question_id}`,
          title: `Question ${note.question_id}`,
          checkpoint: `Question ${note.question_id}`,
          content: note.note_text,
          tags: [],
          date: note.created_at
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

  onMounted(async () => {
    await fetchNotes()
    window.addEventListener('scroll', () => {
      isSearchPinnedByScroll.value = window.scrollY > 140
    })
  })

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
          quizId: quizStore.quizId
        }
      })

      searchResults.value = response.results || []
    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  const filterGroups = ref([
    {
      name: 'Checkpoints',
      items: [
        'Checkpoint 1',
        'Checkpoint 2',
        'Checkpoint 3',
        'Checkpoint 4',
        'Checkpoint 5',
        'Checkpoint 6'
      ],
      isOpen: false
    }
  ])

  const toggleGroup = (groupName) => {
    const group = filterGroups.value.find((g) => g.name === groupName)

    if (group) {
      group.isOpen = !group.isOpen
    }
  }

  const headerRef = ref(null)

  defineEmits(['open-quick-capture'])

  defineExpose({
    focusSearch: () => headerRef.value?.focusSearch()
  })
</script>

<template>
  <div class="flex w-full px-6 py-6">
    <div class="pt-[172px]">
      <FilterSidebar
        :filterGroups="filterGroups"
        :is-open="isSidebarOpen"
        @toggle-group="toggleGroup"
        @close="isSidebarOpen = false"
      />
    </div>

    <!-- PAGE WRAPPER -->
    <div class="flex w-full flex-1 flex-col">
      <!-- CENTERED CONTENT -->
      <div class="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col">
        <!-- NORMAL BROWSE MODE -->
        <template v-if="!isSearchActive">
          <!-- HEADER CARD -->
          <div class="mb-6 rounded-lg border border-slate-200 bg-white px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Knowledge Base</h1>

                <div class="mt-2 h-1 w-16 bg-emerald-500"></div>
              </div>

              <button
                @click="showQuickCapture = true"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Plus class="h-5 w-5" />
                Quick Capture
              </button>
            </div>
          </div>

          <!-- SEARCH -->
          <div
            class="mb-6"
            :class="shouldPinSearch ? 'fixed top-6 z-30 w-[980px] max-w-[calc(100vw-6rem)]' : ''"
            :style="
              shouldPinSearch
                ? {
                    left: 'calc(50% + 120px)',
                    transform: 'translateX(-50%)'
                  }
                : {}
            "
          >
            <div
              class="rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2 shadow-sm backdrop-blur-md"
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
          <div>
            <!-- MAIN + DRAWER -->
            <div
              class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_420px] gap-8"
              :class="shouldPinSearch ? 'pt-24' : 'pt-5'"
            >
              <!-- NOTES -->
              <div class="min-w-0">
                <NotesFeed :notes="notes" @open="openNote" />
              </div>

              <!-- DRAWER -->

              <div
                class="fixed right-[120px] w-[420px] transition-all duration-200"
                :class="shouldPinSearch ? 'top-[120px]' : 'top-[245px]'"
              >
                <NoteDetailsDrawer
                  :note="selectedNote"
                  :isOpen="!!selectedNote"
                  @close="selectedNote = null"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- SEARCH MODE -->
        <template v-else>
          <!-- PINNED SEARCH -->
          <div
            class="fixed top-6 z-30 w-[min(1020px,calc(100vw-6rem))]"
            :style="{
              left: 'calc(50% + 110px)',
              transform: 'translateX(-50%)'
            }"
          >
            <div
              class="rounded-3xl border border-slate-200 bg-slate-50/90 px-3 py-2 shadow-sm backdrop-blur-md"
            >
              <div class="flex items-center gap-3">
                <!-- FILTER -->
                <button
                  @click="isSidebarOpen = !isSidebarOpen"
                  class="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-700"
                >
                  <Filter class="h-4 w-4" />
                  Filters
                </button>

                <!-- SEARCH -->
                <div class="min-w-0 flex-1">
                  <SearchBar
                    ref="headerRef"
                    v-model:searchQuery="searchQuery"
                    v-model:activeScope="activeScope"
                    :scopes="scopes"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- RESULTS -->
          <div
            class="grid min-w-0 grid-cols-[minmax(0,1fr)_420px] items-start gap-8 pt-32 transition-all duration-200"
            :class="isSidebarOpen ? 'pl-7' : ''"
          >
            <!-- RESULTS -->
            <div class="min-w-0 mr-3 max-w-[700px]">
              <SearchResults
                :searchResults="searchResults"
                :searchQuery="searchQuery"
                @open="selectedNote = $event"
              />
            </div>

            <!-- DRAWER -->
            <div
              class="fixed right-[120px] transition-all duration-200"
              :class="shouldPinSearch ? 'top-[159px] w-[360px]' : 'top-[245px] w-[420px]'"
            >
              <NoteDetailsDrawer
                :note="selectedNote"
                :isOpen="!!selectedNote"
                @close="selectedNote = null"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

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
            <QuickCapture
              @close="showQuickCapture = false"
              @save="
                (note) => {
                  console.log(note)
                  showQuickCapture = false
                }
              "
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
