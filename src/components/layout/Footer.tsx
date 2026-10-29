export default function Footer() {
  const socials = [
    { label: 'GitHub', href: 'https://github.com/guish207423-ux' },
    { label: 'Email', href: 'mailto:guish207423@gmail.com' },
    // 微信没有可指向的公开链接，别留 href="#"（点了没反应 = 死链），直接去联系区看号
    { label: 'WeChat', href: '#contact' },
  ]

  return (
    <footer className="footer">
      {/* Background accent */}
      <div aria-hidden="true" className="footer__accent" />

      <div className="container footer__inner">
        {/* Top row */}
        <div className="footer__top">
          <div className="footer__brand">
            <p className="footer__brand-name">屿作所</p>
            <p className="footer__brand-desc">Yu Studio · 综合数字产品工作室<br />做界面、做前端、把设计稿变成能跑的代码</p>
            <div className="footer__socials">
              {socials.map(s => (
                <a key={s.label} href={s.href} className="footer__social-link">{s.label}</a>
              ))}
            </div>
          </div>

          <div className="footer__nav-grid">
            <nav aria-label="页脚导航">
              <p className="footer__nav-title">导航</p>
              <div className="footer__nav-list">
                {[
                  { href: '#about', label: '关于我们' },
                  { href: '#services', label: '能做什么' },
                  { href: '#works', label: '技术资产' },
                  { href: '#cases', label: '做过哪些项目' },
                  { href: '#pricing', label: '价格' },
                  { href: '#contact', label: '联系方式' },
                ].map(l => (
                  <a key={l.href} href={l.href} className="footer__nav-link">{l.label}</a>
                ))}
              </div>
            </nav>

            <div>
              <p className="footer__nav-title">联系</p>
              <div className="footer__nav-list">
                <a href="mailto:guish207423@gmail.com" className="footer__nav-link footer__contact-text">guish207423@gmail.com</a>
                <p className="footer__contact-text">微信: qqwwlfy2423</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer__newsletter">
          <p className="footer__newsletter-title">留个邮箱</p>
          <p className="footer__newsletter-desc">有新笔记时给你发一封。不发广告，随时可以喊停。</p>
          <form onSubmit={(e) => {
            e.preventDefault()
            const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
            if (email) {
              window.location.href = `mailto:guish207423@gmail.com?subject=想收新笔记&body=我的邮箱：${encodeURIComponent(email)}`
            }
          }} className="footer__newsletter-form">
            <input
              name="email"
              type="email"
              aria-label="你的邮箱地址"
              placeholder="你的邮箱"
              required
              className="footer__newsletter-input"
            />
            <button type="submit" className="btn btn--sm btn--primary">
              <span>订阅</span>
            </button>
          </form>
        </div>

        <hr className="footer__divider" />
        <div className="footer__bottom">
          <p className="footer__copyright">© 2026 屿作所 · 保留所有权利</p>
          <p className="footer__credit">Built with React + Vite + hyalite.js</p>
        </div>
      </div>
    </footer>
  )
}
