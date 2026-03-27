<script setup>
  import { computed } from 'vue'
  import BlogHero from '~/components/blog/BlogHero.vue'
  import BlogTOC from '~/components/blog/BlogTOC.vue'
  import BlogContent from '~/components/blog/BlogContent.vue'
  import BlogCTA from '~/components/blog/BlogCTA.vue'
  import BlogRelated from '~/components/blog/BlogRelated.vue'
  import BlogProgress from '~/components/blog/BlogProgress.vue'

  const route = useRoute()

  const { data } = await useFetch(
    `https://wp.golaunchscall.com/wp-json/wp/v2/posts?_embed&slug=${route.params.slug}`
  )

  const post = computed(() => data.value?.[0])

  // clean content
  const cleanContent = computed(() => post.value?.content?.rendered || '')
</script>

<template>
  <div v-if="post">
    <BlogProgress />
    <BlogHero :post="post" />
    <BlogTOC :content="cleanContent" />
    <BlogContent :content="cleanContent" />
    <BlogCTA />
    <BlogRelated />
  </div>
</template>
