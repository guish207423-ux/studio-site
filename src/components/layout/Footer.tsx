export default function Footer() {
  const socials = [
    { label: 'GitHub', href: 'https://github.com/guish207423-ux' },
    { label: 'Email', href: 'mailto:guish207423@gmail.com' },
    { label: 'WeChat', href: '#' },
  ]

  return (
    <footer className="footer" style={{
      background: 'var(--c-ink)',
      borderTop: '1px solid var(--c-line)',
      padding: 'var(--sp-7) 0 var(--sp-5)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background accent */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        bottom: '-30%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw',
        height: '40vw',
        background: 'radial-gradient(ellipse, rgba(212, 255, 63, 0.06) 0%, transparent 60%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-6)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--sp-6)',
        }}>
          <div style={{ maxWidth: 400 }}>
            <p style={{
              fontWeight: 900,
              fontSize: 'clamp(36px, 5vw, 56px)',
              color: 'var(--c-txt)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}>屿作所</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--c-txt-2)',
              marginTop: 'var(--sp-2)',
              lineHeight: 1.6,
            }}>Yu Studio · 综合数字产品工作室<br />以光学与形变，构建数字产品的视觉语言</p>
            <div style={{
              display: 'flex',
              gap: 'var(--sp-3)',
              marginTop: 'var(--sp-4)',
            }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--c-txt-3)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--r-pill)',
                  border: '1px solid var(--c-line)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--c-accent)'
                  e.currentTarget.style.borderColor = 'var(--c-accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--c-txt-3)'
                  e.currentTarget.style.borderColor = 'var(--c-line)'
                }}
                >{s.label}</a>
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--sp-6)',
          }}>
            <nav aria-label="页脚导航">
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--c-txt-3)',
                marginBottom: 'var(--sp-3)',
              }}>导航</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {[
                  { href: '#about', label: '关于我们' },
                  { href: '#services', label: '服务能力' },
                  { href: '#works', label: '作品展示' },
                  { href: '#process', label: '工作流程' },
                  { href: '#contact', label: '联系方式' },
                ].map(l => (
                  <a key={l.href} href={l.href} style={{
                    color: 'var(--c-txt-2)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-txt-2)')}
                  >{l.label}</a>
                ))}
              </div>
            </nav>

            <div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--c-txt-3)',
                marginBottom: 'var(--sp-3)',
              }}>联系</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <a href="mailto:guish207423@gmail.com" style={{
                  color: 'var(--c-txt-2)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono)',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-txt-2)')}
                >guish207423@gmail.com</a>
                <p style={{
                  color: 'var(--c-txt-2)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono)',
                }}>微信: qqwwlfy2423</p>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--c-line)' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-2)',
        }}>
          <p style={{
            fontSize: '12px',
            color: 'var(--c-txt-3)',
            fontFamily: 'var(--font-mono)',
          }}>© 2026 屿作所 · 保留所有权利</p>
          <p style={{
            fontSize: '12px',
            color: 'var(--c-txt-3)',
            fontFamily: 'var(--font-mono)',
          }}>Built with React + Vite + hyalite.js</p>
        </div>
      </div>
    </footer>
  )
}
