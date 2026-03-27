<script setup>
  const { data: posts } = await useFetch(
    'https://wp.golaunchscall.com/wp-json/wp/v2/posts?per_page=3'
  )
</script>

<template>
  <div class="mx-auto mt-16 max-w-3xl px-4">
    <h3 class="mb-6 text-xl font-semibold">Related posts</h3>

    <div v-for="post in posts" :key="post.id">
      <NuxtLink :to="`/blog/${post.slug}`">
        {{ post.title.rendered }}
      </NuxtLink>
    </div>
  </div>
</template>
