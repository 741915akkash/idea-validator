<script setup>
  import { computed } from 'vue'

  const props = defineProps(['content'])

  // inject CTA after 2nd paragraph
  const processedContent = computed(() => {
    if (!props.content) return ''

    const parts = props.content.split('</p>')

    if (parts.length > 2) {
      parts.splice(
        2,
        0,
        `
      </p>
      <div class="bg-gray-100 p-6 rounded-lg my-8 text-center">
        <h3 class="text-lg font-semibold mb-2">
          Validate your idea faster
        </h3>
        <p class="text-gray-600 mb-3">
          Turn assumptions into testable questions in minutes.
        </p>
        <a href="/" class="text-blue-600 font-medium">
          Try it now →
        </a>
      </div>
      <p>
      `
      )
    }

    return parts.join('</p>')
  })
</script>

<template>
  <section class="mx-auto max-w-3xl px-4">
    <div class="prose prose-lg" v-html="processedContent"></div>
  </section>
</template>
