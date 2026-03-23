export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const GA_ID = config.public.gaMeasurementId || 'G-NE3B20WL6Q'

  if (!GA_ID) {
    console.warn('[ga] Missing GA4 measurement ID. Set NUXT_PUBLIC_GA_MEASUREMENT_ID.')
    return
  }

  if (window.__gaInitialized) {
    return
  }
  window.__gaInitialized = true

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments)
    }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    send_page_view: false,
    anonymize_ip: true,
    debug_mode: true
  })

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)

  const sendPageView = (path) => {
    if (!window.gtag) {
      return
    }
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title,
      page_location: window.location.href,
      send_to: GA_ID
    })
  }

  sendPageView(window.location.pathname + window.location.search)

  const router = useRouter()
  router.afterEach((to) => {
    sendPageView(to.fullPath)
  })
})
