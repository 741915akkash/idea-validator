<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Twitter, Linkedin, Facebook, Link, Check } from 'lucide-vue-next'

  const props = defineProps(['post'])

  const cleanExcerpt = (html) => html?.replace(/<[^>]+>/g, '') || ''
  const stripHtml = (html) => html?.replace(/<[^>]+>/g, '') || ''

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const authorName = props.post?._embedded?.author?.[0]?.name || 'GoLaunchScall Team'
  const postDate = formatDate(props.post?.date)
  const readingTime = computed(() => {
    const contentText = stripHtml(props.post?.content?.rendered).replace(/\s+/g, ' ').trim()
    if (!contentText) return '1 min read'

    const wordCount = contentText.split(' ').length
    const minutes = Math.max(1, Math.ceil(wordCount / 200))
    return `${minutes} min read`
  })

  const currentUrl = ref('')
  const currentTitle = ref('')

  onMounted(() => {
    const slug = props.post?.slug || ''
    currentUrl.value = `https://golaunchscall.com/${slug}`
    currentTitle.value = props.post?.title?.rendered || ''
  })

  const shareUrl = computed(() => encodeURIComponent(currentUrl.value))
  const shareTitle = computed(() => encodeURIComponent(currentTitle.value))

  const copied = ref(false)
  const copyLink = async () => {
    if (typeof window === 'undefined') return

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href)
      } else {
        // Fallback for older browsers or restricted environments
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-12 text-center">
    <!-- Heading -->
    <h1
      class="mb-6 text-4xl font-bold leading-tight text-app-text md:text-5xl"
      v-html="post.title.rendered"
    />

    <!-- Author + Date -->
    <div class="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-app-muted">
      <span>{{ authorName }}</span>
      <span class="text-app-muted">•</span>
      <span>{{ postDate }}</span>
      <span class="text-app-muted">•</span>
      <span>{{ readingTime }}</span>
    </div>

    <!-- Social Share Icons -->
    <div class="mb-10 flex items-center justify-center gap-4">
      <a
        :href="`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`"
        target="_blank"
        rel="noopener noreferrer"
        class="p-2 text-app-muted transition-colors hover:text-black"
        title="Share on Twitter"
      >
        <Twitter :size="20" />
      </a>
      <a
        :href="`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`"
        target="_blank"
        rel="noopener noreferrer"
        class="p-2 text-app-muted transition-colors hover:text-black"
        title="Share on LinkedIn"
      >
        <Linkedin :size="20" />
      </a>
      <a
        :href="`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`"
        target="_blank"
        rel="noopener noreferrer"
        class="p-2 text-app-muted transition-colors hover:text-black"
        title="Share on Facebook"
      >
        <Facebook :size="20" />
      </a>
      <button
        @click="copyLink"
        class="relative p-2 text-app-muted transition-colors hover:text-black"
        title="Copy link"
      >
        <Check v-if="copied" :size="20" class="text-green-500" />
        <Link v-else :size="20" />
        <span
          v-if="copied"
          class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white"
        >
          Copied!
        </span>
      </button>
    </div>

    <!-- Excerpt -->
    <p class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-app-muted">
      {{ cleanExcerpt(post.excerpt.rendered) }}
    </p>

    <!-- Featured Image -->
    <img
      v-if="post._embedded?.['wp:featuredmedia']?.[0]?.source_url"
      :src="post._embedded['wp:featuredmedia'][0].source_url"
      class="aspect-video w-full rounded-2xl object-cover shadow-xl"
      referrerpolicy="no-referrer"
    />
  </section>
</template>
