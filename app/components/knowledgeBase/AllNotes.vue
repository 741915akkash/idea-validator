<script setup>
  import { ref } from 'vue'
  import { MessageSquare, User, Plus } from 'lucide-vue-next'
  import FilterSidebar from './FilterSidebar.vue'
  import SearchBar from './SearchBar.vue'
  import NotesFeed from './NotesFeed.vue'
  import SearchResults from './SearchResults.vue'
  import QuickCapture from './QuickCapture.vue'

  const searchQuery = ref('')
  const showQuickCapture = ref(false)
  const activeScope = ref('ALL')
  const isSidebarOpen = ref(false)
  const scopes = ['ALL', 'Notes', 'Interviews', 'CRM', 'Reddit']

  const searchResults = [
    {
      category: 'Questions',
      icon: MessageSquare,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      items: [
        {
          title: 'How do users handle compliance panic?',
          snippet: '"...panic usually starts 48h before the deadline"'
        },
        {
          title: 'Why do accounting firms fail at LinkedIn ads?',
          snippet: 'Targeting overlap with general business owners seen as primary cause.'
        }
      ]
    },
    {
      category: 'Interviews',
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      items: [
        {
          title: 'Rahul Sharma interview #3',
          snippet: '"...clients only care after govt warning... we need to lead with that."'
        }
      ]
    }
  ]

  const notes = [
    {
      id: 1,
      title: 'What triggers someone to act?',
      checkpoint: 'Checkpoint 2 · Urgency',
      content:
        '"Users only search after govt notice..." - This snippet from interview #3 changes our hypothesis about acquisition.',
      tags: ['compliance', 'panic', 'b2b', 'urgency'],
      date: '2h ago'
    },
    {
      id: 2,
      title: 'Pricing concerns from interviews',
      checkpoint: 'Checkpoint 6 · Pricing',
      content:
        '"Agencies are compared against freelancers" - High price sensitivity in small agencies.',
      tags: ['pricing', 'positioning'],
      date: '5h ago'
    },
    {
      id: 3,
      title: 'Distribution Ideas',
      checkpoint: 'Checkpoint 4 · Distribution',
      content: 'LinkedIn ads worked for small law firms but failed for accounting agencies.',
      tags: ['distribution', 'ads', 'legal'],
      date: '1d ago'
    }
  ]

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
    },
    {
      name: 'Tags',
      items: ['urgency', 'pricing', 'leads', 'compliance', 'b2b', 'positioning'],
      isOpen: false
    },
    {
      name: 'Date',
      items: ['Last 24h', 'Last 7 days', 'Last 30 days', 'Custom Range'],
      isOpen: false
    },
    { name: 'Priority', items: ['High', 'Medium', 'Low'], isOpen: false },
    {
      name: 'AI Signals',
      items: ['Strong Intent', 'Pain Point', 'Pricing Objection', 'Feature Request'],
      isOpen: false
    }
  ])

  const toggleGroup = (groupName) => {
    const group = filterGroups.value.find((g) => g.name === groupName)
    if (group) group.isOpen = !group.isOpen
  }

  const headerRef = ref(null)

  defineEmits(['open-quick-capture'])

  defineExpose({
    focusSearch: () => headerRef.value?.focusSearch()
  })
</script>

<template>
  <div class="flex h-full overflow-hidden px-6 py-6">
    <FilterSidebar
      :filterGroups="filterGroups"
      :is-open="isSidebarOpen"
      @toggle-group="toggleGroup"
      @close="isSidebarOpen = false"
    />

    <!-- PAGE WRAPPER -->
    <div class="mx-auto w-full max-w-2xl">
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
      <!-- CONTENT -->
      <div class="mx-auto grid w-full max-w-[700px] grid-cols-[44px_minmax(0,520px)] gap-4 px-6">
        <!-- FILTER COLUMN -->
        <div class="pt-5">
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="group relative rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:bg-slate-50"
            :class="{
              'border-emerald-200 bg-white text-emerald-600 shadow-sm': isSidebarOpen
            }"
          >
            <Filter class="h-4 w-4" />

            <div
              v-if="!isSidebarOpen"
              class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
            ></div>
          </button>
        </div>

        <!-- SEARCH + NOTES -->
        <div class="min-w-0">
          <SearchBar
            ref="headerRef"
            v-model:searchQuery="searchQuery"
            v-model:activeScope="activeScope"
            :scopes="scopes"
          />

          <div class="custom-scrollbar flex-1 overflow-y-auto py-5">
            <SearchResults
              v-if="searchQuery"
              :searchResults="searchResults"
              :searchQuery="searchQuery"
            />

            <NotesFeed v-else :notes="notes" />
          </div>
        </div>
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
