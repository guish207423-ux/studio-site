import { useEffect, useState } from 'react'

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

export default function FloatingToolbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [cookieVisible, setCookieVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setCookieVisible(true)

    const onScroll = () => {
      setScrolled(window.scrollY > 320)
      setShowTop(window.scrollY > 600)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const acceptCookie = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setCookieVisible(false)
  }

  const declineCookie = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setCookieVisible(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {cookieVisible && (
        <div role="dialog" aria-label="Cookie 使用提示" className="cookie-toast">
          <p className="cookie-toast__text">
            本站不追踪访客，仅使用本地存储记住您的选择。
          </p>
          <div className="cookie-toast__actions">
            <button className="cookie-toast__btn cookie-toast__btn--secondary" onClick={declineCookie}>拒绝</button>
            <button className="cookie-toast__btn cookie-toast__btn--primary" onClick={acceptCookie}>接受</button>
          </div>
        </div>
      )}

      <div className={`fab-group${scrolled ? ' fab-group--visible' : ''}`}>
        {showTop && (
          <button onClick={scrollToTop} aria-label="回到顶部" className="fab-to-top">
            <ArrowUpIcon />
          </button>
        )}

        <div style={{ position: 'relative' }}>
          {open && (
            <div className="fab-menu">
              <p className="fab-menu__title">联系方式</p>
              <a href="mailto:3629748383@qq.com?subject=项目咨询" className="fab-menu__item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                QQ 邮箱
              </a>
              <a href="mailto:guish207423@gmail.com?subject=Project Inquiry" className="fab-menu__item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                Gmail
              </a>
              <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--c-txt-3)' }}>
                微信：qqwwlfy2423
              </div>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? '关闭联系方式' : '打开联系方式'}
            aria-expanded={open}
            className="fab"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : <ChatIcon />}
          </button>
        </div>
      </div>
    </>
  )
}
