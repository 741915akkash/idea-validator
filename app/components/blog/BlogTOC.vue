<script setup>
  import { computed } from 'vue'

  const props = defineProps(['content'])

  const headings = computed(() => {
    if (!props.content) return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(props.content, 'text/html')

    return [...doc.querySelectorAll('h2')].map((h, i) => ({
      id: `section-${i}`,
      text: h.innerText
    }))
  })
</script>

<template>
  <div v-if="headings.length" class="mx-auto mb-10 max-w-3xl px-4">
    <h3 class="mb-3 font-semibold">Table of contents</h3>

    <ul class="space-y-2 text-blue-600">
      <li v-for="h in headings" :key="h.id">
        <a :href="`#${h.id}`">{{ h.text }}</a>
      </li>
    </ul>
  </div>
</template>
