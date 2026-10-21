import { useEffect, useState } from 'react'
import { toggleTheme, getInitialTheme } from '../../styles/theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme())

  useEffect(() => {
    const sync = () => setTheme((document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark')
    sync()
    window.addEventListener('themechange', sync as EventListener)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('themechange', sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={() => { toggleTheme(); setTheme(isDark ? 'light' : 'dark') }}
      aria-label="切换主题"
      aria-pressed={isDark}
      style={{
        background: 'none',
        border: '1px solid var(--c-line)',
        borderRadius: 'var(--r-pill)',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--c-txt)',
        transition: 'transform 180ms ease, opacity 180ms ease',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 180ms ease' }}>
        {isDark ? (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        ) : (
          <circle cx="12" cy="12" r="4" />
        )}
      </svg>
    </button>
  )
}