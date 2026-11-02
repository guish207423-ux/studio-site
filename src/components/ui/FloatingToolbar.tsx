import { useEffect, useRef, useState } from 'react'

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
  const fabRef = useRef<HTMLButtonElement>(null)
  const chipRef = useRef<HTMLButtonElement>(null)
  const [cookieVisible, setCookieVisible] = useState(false)
  // M5：常驻的同意条会长期压住内容（1440 档盖住第一张价格卡）。10 秒后收成一枚
  // 小胶囊，想改主意还能点开 —— 既不是「悄悄消失」，也不常驻遮挡。
  const [cookieCollapsed, setCookieCollapsed] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setCookieVisible(true)
      // 10 秒后自动收成胶囊 —— 但**不能在这里 return**：原先这条早退把下面的滚动
      // 监听整段跳过了，于是首次访问（还没有 consent）的用户整个会话都拿不到
      // 「联系我们 / 回到顶部」这组浮动按钮（scrolled 恒为 false，整组 opacity:0）。
      // 定时器与滚动监听是两件事，各管各的。
    }
    const timer = consent ? null : window.setTimeout(() => setCookieCollapsed(true), 10000)

    const onScroll = () => {
      setScrolled(window.scrollY > 320)
      setShowTop(window.scrollY > 600)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  const acceptCookie = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setCookieVisible(false)
    // 同意条整块卸载，焦点会掉到 body；还给「Cookie 设置」胶囊（它随折叠出现），
    // 键盘用户不必从页首重新 Tab 一遍。rAF：等 chip 挂载完再聚焦。
    requestAnimationFrame(() => chipRef.current?.focus())
  }

  const declineCookie = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setCookieVisible(false)
    requestAnimationFrame(() => chipRef.current?.focus())
  }

  // FAB 面板：Esc 关闭 + 焦点回 FAB。原先按 Esc 无反应（aria-expanded 仍为 true），
  // 焦点也从不进入面板（评审 S5）。
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      requestAnimationFrame(() => fabRef.current?.focus())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {cookieVisible && cookieCollapsed && (
        <button ref={chipRef} className="cookie-chip" onClick={() => setCookieCollapsed(false)}>
          Cookie 设置
        </button>
      )}

      {cookieVisible && !cookieCollapsed && (
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

      {/* 未滚动到位时整组 opacity:0 + pointer-events:none，但里面的按钮仍在 Tab 序列里
          （实测桌面端 FAB 是最后一个停靠点，聚焦后什么都看不见、鼠标也点不到）。
          inert 把它整组从 Tab 序列与无障碍树里摘掉，--visible 时再恢复。 */}
      <div className={`fab-group${scrolled ? ' fab-group--visible' : ''}`} inert={!scrolled}>
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
            ref={fabRef}
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
