export type HyaliteConfig = { light: number }

export const HYALITE_BUDGET_DESKTOP = 5
export const HYALITE_BUDGET_MOBILE = 3

export type HyaliteTheme = 'light' | 'dark'

declare global {
  interface Window {
    Hyalite: {
      watch: (root: HTMLElement, selector: string, params: Record<string, unknown>) => { stop: () => void }
      setOpts: (opts: Record<string, unknown>) => Promise<void>
      force: (v: boolean | null) => boolean
      info: () => unknown
      version: string
    }
  }
}

export function currentTheme(): HyaliteTheme {
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' ? 'dark' : 'light'
}

/* 浅色主题下折射边光取自亮面（深色主题保持 hyalite 默认的 -140）。 */
export function hyaliteLightForTheme(theme: HyaliteTheme, kind: 'panel' | 'button' = 'panel'): number {
  if (kind === 'button') return theme === 'dark' ? -120 : 100
  return theme === 'dark' ? -140 : 120
}

/* hyalite 的 `light` 参与滤镜缓存键，必须在滤镜构建时给出，不能事后用 CSS 变量覆盖。
   因此主题切换时走 setOpts 重建，而不是写 --hyalite-light。 */
export async function refreshHyalite(): Promise<void> {
  if (typeof window === 'undefined' || typeof window.Hyalite === 'undefined') return
  const theme = currentTheme()
  try {
    await window.Hyalite.setOpts({ light: hyaliteLightForTheme(theme) })
  } catch {}
  window.dispatchEvent(new CustomEvent('hyalite:refresh', { detail: { theme } }))
}

export function setupHyaliteThemeObserver() {
  if (typeof MutationObserver === 'undefined') return
  const obs = new MutationObserver(() => { void refreshHyalite() })
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => obs.disconnect()
}

export function scanHyaliteInstances(): number {
  let count = 0
  document.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const bf = getComputedStyle(el).backdropFilter
    if (bf && bf !== 'none') count++
  })
  return count
}
