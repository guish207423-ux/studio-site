import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = () => {
      setVisible(window.scrollY > 600)
    }
    check()
    const interval = setInterval(check, 500)
    window.addEventListener('scroll', check, { passive: true })
    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', check)
    }
  }, [])

  if (!visible) return null

  return (
    <button
      className="scroll-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'var(--c-accent)',
        color: '#050505',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 700,
        zIndex: 90,
        boxShadow: '0 4px 16px rgba(212,255,63,0.3)',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
      }}
    >
      ↑
    </button>
  )
}
