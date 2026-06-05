const posthogEnabled = process.env.NUXT_PUBLIC_POSTHOG_ENABLED === 'true'

export default defineNuxtConfig({
  // ✅ fix nitro warning
  compatibilityDate: '2026-04-25',

  srcDir: 'app',

  app: {
    head: {
      title: 'Go Launch Scall – Validate Your Business Idea with Customer Interviews',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/orbit3.svg' },
        { rel: 'shortcut icon', href: '/orbit3.svg' }
      ],
      meta: [
        {
          name: 'description',
          content:
            'Break your business idea into clear assumptions, validate them with real people through fast customer interviews, and get confidence before you build.'
        }
      ]
    }
  },

  ssr: true,

  nitro: {
    prerender: {
      ignore: ['/__nuxt_content/**']
    }
  },

  runtimeConfig: {
    public: {
      isDev: process.env.NODE_ENV !== 'production',
      experimentsEnabled: process.env.NUXT_PUBLIC_EXPERIMENTS_ENABLED === 'true',
      knowledgeBaseEnabled: process.env.NUXT_PUBLIC_KNOWLEDGE_BASE_ENABLED !== 'false',
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
      posthog: {
        enabled: posthogEnabled,
        publicKey: process.env.NUXT_PUBLIC_POSTHOG_PROJECT_TOKEN || '',
        host: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
      }
    }
  },

  devtools: { enabled: true },
  sourcemap: false,

  vite: {
    optimizeDeps: {
      include: ['lucide-vue-next', 'posthog-js', '@tanstack/vue-table', 'vuedraggable']
    },
    server: {
      watch: {
        ignored: ['**/.git/**', '**/.output/**']
      }
    }
  },

  modules: [
    ...(posthogEnabled ? ['@posthog/nuxt'] : []),
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts',
    '@pinia/nuxt',
    'lucide-nuxt',
    '@nuxtjs/sitemap',
    '@nuxt/content'
  ],

  // ✅ Nuxt Content FIX + config
  content: {
    sources: {
      content: {
        driver: 'fs',
        base: './content'
      }
    },

    navigation: {
      fields: ['title']
    },

    highlight: {
      theme: 'github-light'
    }
  },

  posthogConfig: {
    publicKey: process.env.NUXT_PUBLIC_POSTHOG_PROJECT_TOKEN || '',
    host: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    clientConfig: {
      capture_exceptions: true,
      __add_tracing_headers: ['localhost', 'golaunchscall.com']
    },
    serverConfig: {
      enableExceptionAutocapture: true
    }
  },

  sitemap: {
    siteUrl: 'https://golaunchscall.com',

    urls: async () => {
      const fetchJsonArray = async (url) => {
        try {
          const res = await fetch(url, {
            headers: { accept: 'application/json' }
          })
          const contentType = res.headers.get('content-type') || ''
          if (!res.ok || !contentType.includes('application/json')) {
            return []
          }
          const data = await res.json()
          return Array.isArray(data) ? data : []
        } catch {
          return []
        }
      }

      const [posts, categories] = await Promise.all([
        fetchJsonArray('https://wp.golaunchscall.com/wp-json/wp/v2/posts?per_page=100'),
        fetchJsonArray('https://wp.golaunchscall.com/wp-json/wp/v2/categories')
      ])

      return [
        { loc: '/' },
        { loc: '/blog' },

        ...posts.map((post) => ({
          loc: `/blog/${post.slug}`,
          lastmod: post.modified ? new Date(post.modified).toISOString() : undefined
        })),

        ...categories.map((cat) => ({
          loc: `/blog/category/${cat.slug}`
        }))
      ]
    }
  },

  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google'
      }
    ]
  },

  tailwindcss: {
    configPath: 'tailwind.config.js'
  },

  hooks: {
    'tailwindcss:config'(config) {
      config.theme ||= {}
      config.theme.extend ||= {}
      config.theme.extend.fontFamily ||= {}
      config.theme.extend.fontFamily.sans = ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
    }
  }
})
