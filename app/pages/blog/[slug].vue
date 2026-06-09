<script setup>
  import { computed, watchEffect } from 'vue'
  import BlogHero from '~/components/blog/BlogHero.vue'
  import BlogTOC from '~/components/blog/BlogTOC.vue'
  import BlogContent from '~/components/blog/BlogContent.vue'
  import BlogCTA from '~/components/blog/BlogCTA.vue'
  import BlogRelated from '~/components/blog/BlogRelated.vue'
  import BlogProgress from '~/components/blog/BlogProgress.vue'
  import BlogBreadcrumbs from '~/components/blog/BlogBreadcrumbs.vue'

  definePageMeta({
    layout: 'blog'
  })

  const route = useRoute()
  const slug = route.params.slug

  const { data, pending, error } = await useFetch(
    `https://wp.golaunchscall.com/wp-json/wp/v2/posts?_embed&slug=${slug}`
  )

  const post = computed(() => data.value?.[0])

  // clean text helper
  const stripHtml = (html) =>
    html
      ?.replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim() || ''

  // SEO (CRITICAL)
  watchEffect(() => {
    if (!post.value) return

    const seo = post.value.rank_math_head_json || {}

    useHead({
      title: seo.title || post.value.title.rendered,

      meta: [
        {
          name: 'description',
          content: seo.description || stripHtml(post.value.excerpt.rendered)
        },

        {
          property: 'og:title',
          content: seo.og_title || post.value.title.rendered
        },
        {
          property: 'og:description',
          content: seo.og_description || stripHtml(post.value.excerpt.rendered)
        },
        {
          property: 'og:type',
          content: 'article'
        },
        {
          property: 'og:url',
          content: `https://golaunchscall.com/blog/${post.value.slug}`
        },
        {
          property: 'og:image',
          content:
            seo.og_image?.[0]?.url || post.value._embedded?.['wp:featuredmedia']?.[0]?.source_url
        },

        {
          name: 'twitter:card',
          content: 'summary_large_image'
        }
      ],

      link: [
        {
          rel: 'canonical',
          href: `https://golaunchscall.com/blog/${post.value.slug}`
        }
      ],

      // ✅ ADD SCHEMA HERE
      script: seo.schema
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify(seo.schema)
            }
          ]
        : []
    })
  })

  // content
  const cleanContent = computed(() => post.value?.content?.rendered || '')
</script>

<template>
  <!-- Loading -->
  <div v-if="pending" class="flex h-64 items-center justify-center">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-app-border border-t-black"></div>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="mx-auto max-w-3xl px-4 py-20 text-center">
    <h2 class="text-2xl font-bold text-app-text">Error loading post</h2>
    <p class="mt-2 text-app-muted">Please try again later.</p>
  </div>

  <!-- Success -->
  <div v-else-if="post">
    <BlogProgress />
    <BlogBreadcrumbs />

    <BlogHero :post="post" />
    <BlogTOC :content="cleanContent" />
    <BlogContent :content="cleanContent" />

    <BlogCTA />
    <BlogRelated />
  </div>

  <!-- Not found -->
  <div v-else class="mx-auto max-w-3xl px-4 py-20 text-center">
    <h2 class="text-2xl font-bold text-app-text">Post not found</h2>
    <NuxtLink to="/" class="mt-4 inline-block font-medium text-black hover:underline">
      Back to home
    </NuxtLink>
  </div>
</template>
