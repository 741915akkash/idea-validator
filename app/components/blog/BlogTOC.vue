<script setup>
  import { computed } from 'vue'

  const props = defineProps(['content'])

  const stripTags = (value = '') =>
    value
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const decodeEntities = (value = '') =>
    value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

  const slugify = (value = '') => {
    const base = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return base || 'section'
  }

  const headingRegex = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi

  const headings = computed(() => {
    if (!props.content) return []

    const matches = [...props.content.matchAll(headingRegex)]
    const seen = new Map()

    return matches
      .map((match) => {
        const level = `h${match[1]}`
        const text = decodeEntities(stripTags(match[2]))
        if (!text) return null

        const baseSlug = slugify(text)
        const currentCount = seen.get(baseSlug) || 0
        const nextCount = currentCount + 1
        seen.set(baseSlug, nextCount)
        const id = nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`

        return {
          id,
          text,
          level
        }
      })
      .filter(Boolean)
  })
</script>

<template>
  <div v-if="headings.length > 0" class="mx-auto mb-12 max-w-3xl px-4">
    <div class="border-y border-app-border py-8">
      <h3 class="mb-4 text-base font-bold uppercase tracking-wide text-app-text">
        Table of contents
      </h3>

      <ul class="space-y-2">
        <li
          v-for="h in headings"
          :key="h.id"
          :class="{
            'ml-4': h.level === 'h3',
            'ml-8': h.level === 'h4'
          }"
        >
          <a :href="`#${h.id}`" class="text-base font-medium text-blue-600 hover:text-blue-700">
            {{ h.text }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
