import { useEffect, useState } from 'react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      background: 'var(--c-panel)',
      borderTop: '1px solid var(--c-line)',
      padding: 'var(--sp-4) var(--sp-5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 'var(--sp-3)',
    }}>
      <p style={{ fontSize: '14px', color: 'var(--c-txt-2)', margin: 0, flex: 1, minWidth: '200px' }}>
        本网站使用 Cookie 提升体验。继续浏览即表示同意。
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={decline} style={{
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid var(--c-line)',
          borderRadius: 'var(--r-md)',
          color: 'var(--c-txt-2)',
          cursor: 'pointer',
          fontSize: '13px',
        }}>拒绝</button>
        <button onClick={accept} style={{
          padding: '8px 16px',
          background: 'var(--c-accent)',
          border: 'none',
          borderRadius: 'var(--r-md)',
          color: 'var(--c-accent-ink)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
        }}>接受</button>
      </div>
    </div>
  )
}
