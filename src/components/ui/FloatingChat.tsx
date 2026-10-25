import { useEffect, useState } from 'react'

function ChatIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  // 首屏不出现，滚过 hero 再淡入：既不挡内容，也不和主 CTA 抢注意力
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="floating-chat" style={{
      position: 'fixed',
      bottom: 'calc(24px + var(--cookie-h, 0px))',
      right: '24px',
      zIndex: 150,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'flex-end',
      opacity: scrolled || open ? 1 : 0,
      transform: scrolled || open ? 'translateY(0)' : 'translateY(10px)',
      pointerEvents: scrolled || open ? 'auto' : 'none',
      transition: 'opacity 0.25s ease, transform 0.25s var(--ease-out-expo)',
    }}>
      {open && (
        <div style={{
          background: 'var(--c-panel)',
          border: '1px solid var(--c-line)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--sp-4)',
          width: '264px',
          boxShadow: '0 16px 40px -12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: '13px', marginBottom: 'var(--sp-3)', color: 'var(--c-txt-3)' }}>
            选择联系方式
          </p>
          <a href="mailto:3629748383@qq.com?subject=项目咨询" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px 16px',
            minHeight: '44px',
            background: 'var(--c-accent)',
            color: 'var(--c-accent-ink)',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '8px',
          }}><MailIcon /> 发送邮件</a>
          <a href="mailto:guish207423@gmail.com?subject=Project Inquiry" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px 16px',
            minHeight: '44px',
            background: 'transparent',
            color: 'var(--c-txt)',
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '14px',
          }}><MailIcon /> Gmail</a>
          <p style={{ fontSize: '12px', marginTop: 'var(--sp-3)', color: 'var(--c-txt-3)', textAlign: 'center' }}>
            微信 qqwwlfy2423
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'rgba(18, 18, 18, 0.92)',
          color: 'var(--c-accent)',
          border: '1px solid rgba(212, 255, 63, 0.42)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.6)',
          transition: 'transform 0.18s var(--ease-out-expo), box-shadow 0.18s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(0,0,0,0.7)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.6)'
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
        aria-label={open ? '关闭联系方式' : '打开联系方式'}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : <ChatIcon />}
      </button>
    </div>
  )
}
