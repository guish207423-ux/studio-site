export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {}
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
}

export function toggleTheme() {
  const current = (document.documentElement.getAttribute('data-theme') as Theme) || 'dark'
  applyTheme(current === 'dark' ? 'light' : 'dark')
}

export function initTheme() {
  applyTheme(getInitialTheme())
}
