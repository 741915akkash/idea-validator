<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    title: String,
    tone: {
      type: String,
      validator: (v) => ['positive', 'negative', 'neutral'].includes(v)
    },
    items: {
      type: Array,
      default: () => []
    }
  })

  /* -------------------------------------------------
   Priority helpers
------------------------------------------------- */

  function priorityMeta(priority) {
    if (priority >= 79) {
      return {
        label: 'High',
        classes: 'bg-red-100 text-red-700 border-red-200'
      }
    }
    if (priority >= 65) {
      return {
        label: 'Medium',
        classes: 'bg-amber-100 text-amber-700 border-amber-200'
      }
    }
    return {
      label: 'Low',
      classes: 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  /* -------------------------------------------------
   Tone styles
------------------------------------------------- */

  const toneClasses = {
    positive: {
      title: 'text-emerald-700',
      bullet: 'text-emerald-900',
      dot: 'bg-emerald-500'
    },
    negative: {
      title: 'text-rose-700',
      bullet: 'text-rose-900',
      dot: 'bg-rose-500'
    },
    neutral: {
      title: 'text-slate-700',
      bullet: 'text-slate-900',
      dot: 'bg-slate-500'
    }
  }
</script>

<template>
  <div class="space-y-3">
    <!-- Section header -->
    <div class="flex items-center justify-between">
      <h3 class="text-s font-semibold uppercase" :class="toneClasses[tone].title">
        {{ title }}
      </h3>

      <!-- Section priority (plain text, no badge) -->
      <span class="text-s font-medium text-gray-900"> Priority </span>
    </div>

    <!-- Items -->
    <ul v-if="items.length" class="space-y-2">
      <li
        v-for="(item, idx) in items"
        :key="item.id"
        class="flex items-start gap-3 pb-2"
        :class="idx !== items.length - 1 ? 'border-b border-gray-200' : ''"
      >
        <!-- content row -->
        <div class="flex w-full items-start justify-between gap-4">
          <!-- insight text -->
          <p class="text-base leading-relaxed text-gray-900">
            {{ item.copy }}
          </p>

          <!-- item priority badge -->
          <span
            class="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium"
            :class="priorityMeta(item.priority).classes"
          >
            {{ priorityMeta(item.priority).label }}
          </span>
        </div>
      </li>
    </ul>

    <!-- Empty state -->
    <p v-else class="text-base italic text-gray-400">No strong signals here.</p>
  </div>
</template>
