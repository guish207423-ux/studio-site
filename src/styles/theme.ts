export type Theme = 'dark'

export function getInitialTheme(): Theme {
  return 'dark'
}

export function applyTheme(_theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', 'dark')
  root.classList.add('dark')
  root.classList.remove('light')
}

export function toggleTheme() {
  // No-op: dark only
}

export function initTheme() {
  applyTheme('dark')
}
