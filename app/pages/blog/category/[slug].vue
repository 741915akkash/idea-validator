<script setup>
  import { computed, watchEffect } from 'vue'

  const route = useRoute()

  // 1. Get category
  const { data: categories } = await useFetch(
    `https://wp.golaunchscall.com/wp-json/wp/v2/categories?slug=${route.params.slug}`
  )

  const categoryId = computed(() => categories.value?.[0]?.id)

  // 2. Get posts
  const { data: posts } = await useFetch(() =>
    categoryId.value
      ? `https://wp.golaunchscall.com/wp-json/wp/v2/posts?categories=${categoryId.value}`
      : null
  )

  // Clean excerpt
  const cleanExcerpt = (html) => html?.replace(/<[^>]+>/g, '') || ''

  // SEO (reactive)
  watchEffect(() => {
    if (!route.params.slug) return

    useHead({
      title: `${route.params.slug} articles`,
      link: [
        {
          rel: 'canonical',
          href: `https://golaunchscall.com/blog/category/${route.params.slug}`
        }
      ]
    })
  })
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="mb-6 text-3xl font-bold capitalize">
      {{ route.params.slug }}
    </h1>

    <div v-for="post in posts" :key="post.id" class="mb-8">
      <NuxtLink :to="`/blog/${post.slug}`">
        <h2 class="text-xl font-semibold">
          {{ post.title.rendered }}
        </h2>
      </NuxtLink>

      <p class="text-app-muted mt-2">
        {{ cleanExcerpt(post.excerpt.rendered) }}
      </p>
    </div>
  </div>
</template>
