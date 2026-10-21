export type HyaliteConfig = { light: number }

export const HYALITE_BUDGET_DESKTOP = 5
export const HYALITE_BUDGET_MOBILE = 3

export function hyaliteLightForTheme(theme: 'light' | 'dark', kind: 'panel' | 'button' = 'panel'): number {
  if (kind === 'button') return theme === 'dark' ? -120 : 100
  return theme === 'dark' ? -140 : 120
}

export function refreshHyalite() {
  try {
    const theme = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark'
    document.querySelectorAll<HTMLElement>('.glass').forEach((el) => {
      el.style.setProperty('--hyalite-light', String(hyaliteLightForTheme(theme)))
    })
    window.dispatchEvent(new CustomEvent('hyalite:refresh', { detail: { theme } }))
  } catch {}
}

export function setupHyaliteThemeObserver() {
  if (typeof MutationObserver === 'undefined') return
  const obs = new MutationObserver(() => refreshHyalite())
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
}

export function scanHyaliteInstances(): number {
  let count = 0
  document.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const bf = getComputedStyle(el).backdropFilter
    if (bf && bf !== 'none') count++
  })
  return count
}