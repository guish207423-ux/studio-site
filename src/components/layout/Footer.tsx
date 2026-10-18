export default function Footer() {
  return (
    <footer className="footer" style={{
      background: 'var(--c-ink)',
      borderTop: '1px solid var(--c-line)',
      padding: 'var(--sp-6) 0',
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--sp-4)',
        }}>
          <div>
            <p style={{
              fontWeight: 900,
              fontSize: '44px',
              color: 'var(--c-txt)',
              lineHeight: 1.1,
            }}>屿作所</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--c-txt-2)',
              marginTop: 'var(--sp-1)',
            }}>Yu Studio · 综合数字产品工作室</p>
          </div>
          <nav aria-label="页脚导航" style={{
            display: 'flex',
            gap: 'var(--sp-4)',
            flexWrap: 'wrap',
          }}>
            <a href="#services" style={{ color: 'var(--c-txt-2)', textDecoration: 'none', fontSize: '14px' }}>服务能力</a>
            <a href="#works" style={{ color: 'var(--c-txt-2)', textDecoration: 'none', fontSize: '14px' }}>作品展示</a>
            <a href="#stack" style={{ color: 'var(--c-txt-2)', textDecoration: 'none', fontSize: '14px' }}>技术栈</a>
            <a href="#contact" style={{ color: 'var(--c-txt-2)', textDecoration: 'none', fontSize: '14px' }}>联系方式</a>
          </nav>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--c-line)' }} />
        <p style={{
          fontSize: '12px',
          color: 'var(--c-txt-3)',
        }}>© 2026 屿作所 · 保留所有权利</p>
      </div>
    </footer>
  )
}
