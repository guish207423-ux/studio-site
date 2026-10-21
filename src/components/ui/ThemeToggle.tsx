import { useEffect, useState } from 'react'
import { toggleTheme, getInitialTheme } from '../../styles/theme'

type Theme = 'light' | 'dark'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme())

  useEffect(() => {
    const sync = () =>
      setTheme((document.documentElement.getAttribute('data-theme') as Theme) || 'dark')
    sync()
    window.addEventListener('themechange', sync as EventListener)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('themechange', sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isDark = theme === 'dark'
  const next: Theme = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="nav__theme-toggle"
      onClick={() => { toggleTheme(); setTheme(next) }}
      aria-label={isDark ? '切换到浅色主题' : '切换到深色主题'}
      aria-pressed={isDark}
      title={isDark ? '切换到浅色主题' : '切换到深色主题'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="nav__theme-toggle__icon"
      >
        {isDark ? (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
          </>
        )}
      </svg>
    </button>
  )
}
