import { useEffect, useRef, useState } from 'react'
import BrandMark from '../ui/BrandMark'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  // 焦点归还只在「确实开过」时做 —— 否则首屏挂载就会把焦点抢到汉堡按钮上。
  const hasOpened = useRef(false)

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
    if (drawerOpen) {
      hasOpened.current = true
      window.addEventListener('keydown', onKey)
      // 打开即把焦点移进抽屉：原来焦点留在汉堡按钮上，第一个 Tab 会跳到页面主体
      // （评审 S4）。聚焦用 rAF：此时抽屉刚从 [inert] 解除，同步 focus 会被浏览器忽略。
      const raf = requestAnimationFrame(() => {
        firstLinkRef.current?.focus()
      })
      return () => {
        cancelAnimationFrame(raf)
        document.body.style.overflow = ''
        document.body.classList.remove('drawer-open')
        window.removeEventListener('keydown', onKey)
      }
    }
    // 关闭后把焦点还给汉堡按钮，避免焦点落在已 inert 的抽屉里被浏览器弹到 body。
    if (hasOpened.current) burgerRef.current?.focus()
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
      {/* glass-nav：DECISIONS §7 的两处折射之一（537b0ec 重写导航时丢了这个类名，
          全站折射实例曾因此从 2 掉到 1）。材质在 globals.css 的 .glass-nav 里。 */}
      <header className={`nav glass-nav ${scrolled ? 'nav--scrolled' : ''}`}>
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
            ref={burgerRef}
            className="nav__burger"
            type="button"
            aria-expanded={drawerOpen}
            aria-controls="drawer"
            aria-label={drawerOpen ? '关闭导航菜单' : '打开导航菜单'}
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
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            ref={i === 0 ? firstLinkRef : undefined}
            onClick={() => setDrawerOpen(false)}
            className="drawer__link"
          >{l.label}</a>
        ))}
      </nav>
    </>
  )
}
