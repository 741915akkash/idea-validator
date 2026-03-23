export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || ''
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

  modules: ['@nuxtjs/tailwindcss', '@nuxt/fonts', '@pinia/nuxt', 'lucide-nuxt'],

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
