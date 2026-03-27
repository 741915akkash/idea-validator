<script setup>
  defineProps(['post'])

  const cleanExcerpt = (html) => html?.replace(/<[^>]+>/g, '') || ''
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="mb-4 text-4xl font-bold" v-html="post.title.rendered" />

    <p class="mb-6 text-lg text-gray-600">
      {{ cleanExcerpt(post.excerpt.rendered) }}
    </p>

    <img
      v-if="post._embedded?.['wp:featuredmedia']?.[0]?.source_url"
      :src="post._embedded['wp:featuredmedia'][0].source_url"
      class="rounded-lg"
    />
  </section>
</template>
