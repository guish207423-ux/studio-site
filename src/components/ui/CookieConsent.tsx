import { useEffect, useRef, useState } from 'react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  // 固定条会压住页面底部内容：按实际高度给 body 补 padding，关掉后还原
  useEffect(() => {
    if (!visible || !barRef.current) {
      document.body.style.paddingBottom = ''
      return
    }
    const apply = () => {
      const h = barRef.current?.offsetHeight ?? 0
      document.body.style.paddingBottom = h ? `${h}px` : ''
      document.documentElement.style.setProperty('--cookie-h', h ? `${h}px` : '0px')
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(barRef.current)
    return () => {
      ro.disconnect()
      document.body.style.paddingBottom = ''
      document.documentElement.style.removeProperty('--cookie-h')
    }
  }, [visible])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  const btnBase: React.CSSProperties = {
    minHeight: '44px',
    padding: '0 18px',
    borderRadius: 'var(--r-md)',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div
      ref={barRef}
      className="cookie-bar"
      role="dialog"
      aria-label="Cookie 使用提示"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'var(--c-panel)',
        borderTop: '1px solid var(--c-line)',
        padding: 'var(--sp-3) var(--sp-4)',
        paddingBottom: 'calc(var(--sp-3) + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--sp-3)',
      }}>
      <p className="cookie-text" style={{ fontSize: '14px', color: 'var(--c-txt-2)', margin: 0, flex: 1, minWidth: '200px', lineHeight: 1.5 }}>
        <span className="cookie-text--full">本网站使用 Cookie 提升体验。继续浏览即表示同意。</span>
        <span className="cookie-text--short">使用 Cookie 提升体验。</span>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={decline} style={{
          ...btnBase,
          background: 'transparent',
          border: '1px solid var(--c-line-strong)',
          color: 'var(--c-txt-2)',
        }}>拒绝</button>
        <button onClick={accept} style={{
          ...btnBase,
          background: 'rgba(212, 255, 63, 0.12)',
          border: '1px solid var(--c-accent)',
          color: 'var(--c-accent)',
          fontWeight: 600,
        }}>接受</button>
      </div>
    </div>
  )
}
