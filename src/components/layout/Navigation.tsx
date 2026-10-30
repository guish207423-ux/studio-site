import { useEffect, useState } from 'react'
import BrandMark from '../ui/BrandMark'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    document.body.classList.toggle('drawer-open', drawerOpen)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    if (drawerOpen) window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('drawer-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen])

  const links = [
    { href: '#about', label: '关于' },
    { href: '#services', label: '服务' },
    { href: '#works', label: '技术' },
    { href: '#cases', label: '案例' },
    { href: '#pricing', label: '报价' },
    { href: '#contact', label: '联系' },
  ]

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <nav className="nav__inner" aria-label="主导航">
          <a className="brand" href="#top" aria-label="屿作所 首页">
            <BrandMark size={20} className="brand__mark" />
            <span className="brand__text">
              <span className="brand__name">屿作所</span>
              <span className="brand__latin">Yu Studio</span>
            </span>
          </a>

          <div className="nav__links">
            {links.map(l => (
              <a key={l.href} href={l.href} className="nav__link">{l.label}</a>
            ))}
          </div>

          <button
            className="nav__burger"
            type="button"
            aria-expanded={drawerOpen}
            aria-controls="drawer"
            aria-label="打开导航菜单"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

      {drawerOpen && (
        <div className="drawer-backdrop" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
      )}
      <nav
        id="drawer"
        className={`drawer ${drawerOpen ? 'drawer--open' : ''}`}
        aria-label="移动端导航"
        /* 关闭态必须登出可访问性树与 Tab 序列：原来只做 translateY(100%)，
           焦点仍会停在视口外 6 个 .drawer__link 上（a11y 评审 S1）。 */
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        {links.map(l => (
          <a key={l.href} href={l.href} onClick={() => setDrawerOpen(false)} className="drawer__link">{l.label}</a>
        ))}
      </nav>
    </>
  )
}
