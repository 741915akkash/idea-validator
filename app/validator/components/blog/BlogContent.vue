<script setup>
  import { computed } from 'vue'

  const props = defineProps(['content'])

  const headingRegex = /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi

  const stripTags = (value = '') => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

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

  const withHeadingIds = (html = '') => {
    if (!html) return ''

    const seen = new Map()
    return html.replace(headingRegex, (_match, level, attrs, inner) => {
      const cleanAttrs = (attrs || '').replace(/\s+id=("[^"]*"|'[^']*')/gi, '')
      const headingText = decodeEntities(stripTags(inner))
      const baseSlug = slugify(headingText)
      const currentCount = seen.get(baseSlug) || 0
      const nextCount = currentCount + 1
      seen.set(baseSlug, nextCount)
      const id = nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`
      return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`
    })
  }

  const processedContent = computed(() => withHeadingIds(props.content || ''))
</script>

<template>
  <section class="mx-auto max-w-3xl px-4">
    <div
      class="max-w-none text-lg leading-8 text-slate-700 [&_a]:font-medium [&_a]:text-emerald-700 hover:[&_a]:text-emerald-800 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:text-slate-600 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-slate-900 [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:leading-tight [&_h3]:text-slate-900 [&_h4]:mt-8 [&_h4]:mb-3 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-slate-900 [&_li]:mb-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-6 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6"
      v-html="processedContent"
    ></div>
  </section>
</template>
