<script setup>
  const route = useRoute()

  // get category by slug
  const { data: categories } = await useFetch(
    `https://wp.golaunchscall.com/wp-json/wp/v2/categories?slug=${route.params.slug}`
  )

  const categoryId = computed(() => categories.value?.[0]?.id)

  // fetch posts in that category
  const { data: posts } = await useFetch(() =>
    categoryId.value
      ? `https://wp.golaunchscall.com/wp-json/wp/v2/posts?categories=${categoryId.value}`
      : null
  )

  const cleanExcerpt = (html) => html?.replace(/<[^>]+>/g, '') || ''

  useHead({
    title: `${route.params.slug} - Blog`
  })
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="mb-6 text-3xl font-bold capitalize">
      {{ route.params.slug }}
    </h1>

    <div v-for="post in posts" :key="post.id" class="mb-6">
      <NuxtLink :to="`/blog/${post.slug}`">
        {{ post.title.rendered }}
      </NuxtLink>

      <p>{{ cleanExcerpt(post.excerpt.rendered) }}</p>
    </div>
  </div>
</template>
