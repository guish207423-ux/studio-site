import { useState } from 'react'

export default function FloatingChat() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 150,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'flex-end',
    }}>
      {open && (
        <div style={{
          background: 'var(--c-panel)',
          border: '1px solid var(--c-line)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--sp-4)',
          width: '280px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <p style={{ fontSize: '14px', marginBottom: 'var(--sp-3)', color: 'var(--c-txt-2)' }}>
            选择联系方式：
          </p>
          <a href="mailto:3629748383@qq.com?subject=项目咨询" style={{
            display: 'block',
            padding: '10px 16px',
            background: 'var(--c-accent)',
            color: 'var(--c-accent-ink)',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '8px',
          }}>📧 发送邮件</a>
          <a href="mailto:guish207423@gmail.com?subject=Project Inquiry" style={{
            display: 'block',
            padding: '10px 16px',
            background: 'transparent',
            color: 'var(--c-txt-1)',
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '14px',
            textAlign: 'center',
          }}>📧 Gmail</a>
          <p style={{ fontSize: '12px', marginTop: 'var(--sp-3)', color: 'var(--c-txt-3)', textAlign: 'center' }}>
            微信: qqwwlfy2423
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--c-accent)',
          color: 'var(--c-accent-ink)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(212, 255, 63, 0.3)',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="在线咨询"
      >
        💬
      </button>
    </div>
  )
}
