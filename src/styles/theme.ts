export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export function getInitialTheme(): Theme {
  try {
    const urlTheme = new URLSearchParams(window.location.search).get('theme')
    if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }))
}

export function toggleTheme() {
  const current = (document.documentElement.getAttribute('data-theme') as Theme) || 'dark'
  applyTheme(current === 'dark' ? 'light' : 'dark')
}

export function initTheme() {
  applyTheme(getInitialTheme())
  // cross-tab sync
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
      const root = document.documentElement
      root.setAttribute('data-theme', e.newValue as Theme)
      root.classList.toggle('dark', e.newValue === 'dark')
      root.classList.toggle('light', e.newValue === 'light')
    }
  })
}