export default defineNuxtConfig({
  ssr: true,

  app: {
    head: {
      title: 'Idea Validator – Should You Build This?',
      meta: [
        { name: 'description', content: 'Structured evaluation of business ideas using market and confidence scoring.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  },

  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    databaseUrl: '',
    public: {
      siteUrl: 'https://yourdomain.com'
    }
  }
})
