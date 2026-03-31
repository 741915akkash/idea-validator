export default defineNuxtConfig({
  app: {
    head: {
      title: 'GoLaunchScall – Validate Your Business Idea with Customer Interviews',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' },
        { rel: 'shortcut icon', href: '/favicon.svg?v=2' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' }
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
  runtimeConfig: {
    public: {
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
      posthog: {
        publicKey: process.env.NUXT_PUBLIC_POSTHOG_PROJECT_TOKEN || '',
        host: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
      }
    }
  },

  devtools: { enabled: false },
  sourcemap: false,

  vite: {
    optimizeDeps: {
      include: ['lucide-vue-next', 'posthog-js']
    },
    server: {
      watch: {
        ignored: ['**/.git/**', '**/.output/**']
      }
    }
  },

  modules: ['@posthog/nuxt', '@nuxtjs/tailwindcss', '@nuxt/fonts', '@pinia/nuxt', 'lucide-nuxt', '@nuxtjs/sitemap'],

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
      const posts = await fetch(
        'https://wp.golaunchscall.com/wp-json/wp/v2/posts?per_page=100'
      ).then((res) => res.json())

      const categories = await fetch('https://wp.golaunchscall.com/wp-json/wp/v2/categories').then(
        (res) => res.json()
      )

      return [
        // static pages
        { loc: '/' },
        { loc: '/blog' },

        // blog posts
        ...posts.map((post) => ({
          loc: `/blog/${post.slug}`,
          lastmod: post.modified ? new Date(post.modified).toISOString() : undefined
        })),

        // category pages
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

  hooks: {
    'tailwindcss:config'(config) {
      config.theme ||= {}
      config.theme.extend ||= {}
      config.theme.extend.fontFamily ||= {}
      config.theme.extend.fontFamily.sans = ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
    }
  }
})
