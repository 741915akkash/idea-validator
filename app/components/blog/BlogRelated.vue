<script setup>
  const { data: posts } = await useFetch(
    'https://wp.golaunchscall.com/wp-json/wp/v2/posts?per_page=3'
  )
</script>

<template>
  <div class="mx-auto mt-16 max-w-3xl border-t border-app-border px-4 pt-12">
    <h3 class="mb-6 text-xl font-semibold">Related posts</h3>

    <div class="grid gap-6">
      <div v-for="post in posts" :key="post.id" class="group">
        <NuxtLink :to="`/blog/${post.slug}`" class="block">
          <h4
            class="text-lg font-medium transition-colors group-hover:text-blue-600"
            v-html="post.title.rendered"
          ></h4>
          <p class="mt-1 text-sm text-app-muted">Read more →</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
