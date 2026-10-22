import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0)
      setTimeout(() => setVisible(false), 600)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'var(--c-ink)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 'var(--sp-4)',
      opacity,
      transition: 'opacity 0.6s var(--ease-out-expo)',
      pointerEvents: opacity === 0 ? 'none' : 'auto',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 'var(--r-md)',
        background: 'var(--c-accent)',
        color: 'var(--c-accent-ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontSize: 24,
        boxShadow: '0 0 40px rgba(212, 255, 63, 0.4)',
        animation: 'pulse 1.5s var(--ease-in-out-quart) infinite',
      }}>屿</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: '0.2em',
        color: 'var(--c-txt-3)',
        textTransform: 'uppercase',
      }}>Loading</div>
      <div style={{
        width: 120,
        height: 2,
        background: 'var(--c-panel-2)',
        borderRadius: 'var(--r-pill)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'var(--c-accent)',
          animation: 'loading-bar 1.2s var(--ease-out-expo) forwards',
          transformOrigin: 'left',
        }} />
      </div>
    </div>
  )
}
