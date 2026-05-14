<script setup>
  import { ref } from 'vue'
  import { MessageSquare, User } from 'lucide-vue-next'
  import FilterSidebar from './FilterSidebar.vue'
  import SearchBar from './SearchBar.vue'
  import NotesFeed from './NotesFeed.vue'
  import SearchResults from './SearchResults.vue'

  const searchQuery = ref('')
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
  <div class="flex h-full overflow-hidden bg-white">
    <FilterSidebar
      :filterGroups="filterGroups"
      :is-open="isSidebarOpen"
      @toggle-group="toggleGroup"
      @close="isSidebarOpen = false"
    />

    <div class="flex min-w-0 flex-1 flex-col bg-slate-50">
      <SearchBar
        ref="headerRef"
        v-model:searchQuery="searchQuery"
        v-model:activeScope="activeScope"
        :is-sidebar-open="isSidebarOpen"
        :scopes="scopes"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />

      <div class="custom-scrollbar flex-1 overflow-y-auto px-8 py-6">
        <div class="mx-auto max-w-4xl">
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
</template>
