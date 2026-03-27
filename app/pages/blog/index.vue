<script setup>
  import { computed } from 'vue'

  const route = useRoute()

  // current page
  const page = computed(() => Number(route.query.page || 1))

  const { data, pending, error } = await useFetch(
    `https://wp.golaunchscall.com/wp-json/wp/v2/posts?_embed&per_page=10&page=${page.value}`,
    { watch: [page] }
  )

  const posts = computed(() => data.value || [])

  // check if next page exists
  const hasNextPage = computed(() => posts.value.length === 10)

  const cleanExcerpt = (html) => html?.replace(/<[^>]+>/g, '') || ''

  useHead({
    title: `Blog - Page ${page.value}`,
    meta: [
      {
        name: 'description',
        content: 'Startup idea validation guides and resources'
      }
    ]
  })
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="mb-8 text-3xl font-bold">Blog</h1>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading posts</div>

    <div v-else>
      <div v-for="post in posts" :key="post.id" class="mb-10">
        <NuxtLink :to="`/blog/${post.slug}`" class="text-xl font-semibold">
          {{ post.title.rendered }}
        </NuxtLink>

        <p class="mt-2 text-gray-600">
          {{ cleanExcerpt(post.excerpt.rendered) }}
        </p>
      </div>

      <!-- Pagination -->
      <div class="mt-10 flex justify-between">
        <NuxtLink v-if="page > 1" :to="`/blog?page=${page - 1}`" class="text-blue-600">
          ← Previous
        </NuxtLink>

        <NuxtLink v-if="hasNextPage" :to="`/blog?page=${page + 1}`" class="ml-auto text-blue-600">
          Next →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
