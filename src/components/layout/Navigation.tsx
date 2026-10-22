import { useEffect, useRef, useState } from 'react'


export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const links = [
    { href: '#about', label: '关于我们' },
    { href: '#services', label: '服务能力' },
    { href: '#works', label: '作品展示' },
    { href: '#cases', label: '案例研究' },
    { href: '#pricing', label: '服务定价' },
    { href: '#contact', label: '联系方式' },
  ]

  return (
    <>
      <header
        ref={navRef}
        className={`glass glass-nav ${scrolled ? 'glass-nav--scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: scrolled ? '12px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: scrolled ? 'min(92vw, 1100px)' : 'min(96vw, 1224px)',
          zIndex: 100,
          borderRadius: 'var(--r-pill)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          transition: 'top 0.4s var(--ease-out-expo), width 0.4s var(--ease-out-expo), box-shadow 0.4s var(--ease-out-expo)',
          boxShadow: scrolled ? 'var(--sh-2)' : 'var(--sh-1)',
          backdropFilter: 'var(--hyalite, var(--glass-blur))',
          WebkitBackdropFilter: 'var(--hyalite, var(--glass-blur))',
        }}
      >
        <nav className="nav__inner" aria-label="主导航" style={{
          maxWidth: '100%',
          margin: '0 auto',
          height: scrolled ? '56px' : '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--sp-4)',
          transition: 'height 0.4s var(--ease-out-expo)',
        }}>
          <a className="brand" href="#top" aria-label="屿作所 首页" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-3)',
            textDecoration: 'none',
          }}>
            <span className="brand__mark" aria-hidden="true" style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--r-md)',
              background: 'var(--c-accent)',
              color: 'var(--c-accent-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '16px',
              boxShadow: '0 0 20px rgba(212, 255, 63, 0.3)',
            }}>屿</span>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand__name" style={{
                fontWeight: 900,
                fontSize: '20px',
                color: 'var(--c-txt)',
                lineHeight: 1.2,
              }}>屿作所</span>
              <span className="brand__latin" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.30em',
                color: 'var(--c-txt-2)',
                textTransform: 'uppercase',
              }}>Yu Studio</span>
            </span>
          </a>

          <div className="nav__links" style={{
            display: 'flex',
            gap: 'var(--sp-1)',
            padding: '4px',
            borderRadius: 'var(--r-pill)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            {links.map(l => (
              <a key={l.href} href={l.href} className="nav__link" style={{
                color: 'var(--c-txt-2)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 500,
                padding: '6px 16px',
                borderRadius: 'var(--r-pill)',
                transition: 'all 0.2s var(--ease-out-expo)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--c-txt)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--c-txt-2)'
                e.currentTarget.style.background = 'transparent'
              }}
              >{l.label}</a>
            ))}
          </div>

          <a href="#contact" className="btn btn--sm btn--primary nav__cta">
            <span>开始一个项目</span>
          </a>

          <button
            className="nav__burger"
            type="button"
            aria-expanded={drawerOpen}
            aria-controls="drawer"
            aria-label="打开导航菜单"
            onClick={() => setDrawerOpen(!drawerOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--c-txt)',
              cursor: 'pointer',
              padding: 'var(--sp-2)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {drawerOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <nav
        id="drawer"
        className="drawer"
        aria-label="移动端导航"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99,
          background: 'var(--c-panel)',
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
          padding: 'var(--sp-5)',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s var(--ease-out-expo)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
        }}
      >
        {links.map(l => (
          <a key={l.href} href={l.href} onClick={() => setDrawerOpen(false)} style={{
            color: 'var(--c-txt)',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: 500,
            padding: 'var(--sp-3) 0',
            borderBottom: '1px solid var(--c-line)',
          }}>{l.label}</a>
        ))}
      </nav>
    </>
  )
}
