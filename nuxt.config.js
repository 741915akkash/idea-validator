export default defineNuxtConfig({
  ssr: true,

  compatibilityDate: '2026-02-25',

  app: {
    head: {
      title: 'Idea Validator – Should You Build This?',
      meta: [
        {
          name: 'description',
          content: 'Structured evaluation of business ideas using market and confidence scoring.'
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow' }
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    }
  },

  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit', 'lucide-vue-next']
    }
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/fonts', '@pinia/nuxt', 'lucide-nuxt'],

  lucide: {
    namePrefix: 'Icon' // Icons will be available as <IconTarget />, <IconZap />, etc.
  },

  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google'
      }
    ]
  },

  // 2. Tell Tailwind to use Inter as the default 'font-sans'
  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
          }
        }
      }
    }
  },

  runtimeConfig: {
    databaseUrl: '',
    public: {
      siteUrl: 'https://yourdomain.com'
    }
  }
})
