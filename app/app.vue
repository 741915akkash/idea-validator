<script setup>
  import { useQuizSessionStore } from '~/stores/quizSession'
  import { bootstrapTheme } from '~/composables/useTheme'

  const quizStore = useQuizSessionStore()
  if (import.meta.client) {
    quizStore.hydrate()
  }

  onMounted(() => {
    bootstrapTheme()
  })

  useHead({
    script: [
      // Google Analytics (gtag)
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-NE3B20WL6Q'
      },
      {
        children: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-NE3B20WL6Q');
      `
      },

      // Microsoft Clarity
      {
        children: `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "uhrslutd28");
      `
      }
    ]
  })
</script>

<template>
  <div
    class="font-sans tracking-[0.02em] [&_h1]:tracking-[0.02em] [&_h2]:tracking-[0.02em] [&_h3]:tracking-[0.02em]"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
