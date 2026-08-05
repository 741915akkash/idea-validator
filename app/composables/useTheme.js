// const THEME_STORAGE_KEY = 'theme'

// export function getStoredTheme() {
//   if (!import.meta.client) {
//     return 'system'
//   }

//   try {
//     return localStorage.getItem(THEME_STORAGE_KEY) || 'system'
//   } catch {
//     return 'system'
//   }
// }

// export function applyThemeMode(theme) {
//   if (!import.meta.client) {
//     return
//   }

//   const root = document.documentElement

//   if (theme === 'dark') {
//     root.classList.add('dark')
//     return
//   }

//   if (theme === 'light') {
//     root.classList.remove('dark')
//     return
//   }

//   const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

//   root.classList.toggle('dark', prefersDark)
// }

// export function bootstrapTheme() {
//   console.log('bootstrapTheme()', getStoredTheme())
//   applyThemeMode(getStoredTheme())
// }

export function bootstrapTheme() {
  if (!import.meta.client) return

  document.documentElement.classList.remove('dark')
}