import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const partners = [
  { name: 'NovaTech', category: 'SaaS' },
  { name: 'Lumina Studio', category: '设计' },
  { name: 'DataPulse', category: '数据' },
  { name: 'PixelForge', category: '游戏' },
  { name: 'CloudSync', category: '云服务' },
  { name: 'Artisan Co', category: '电商' },
]

export default function Partners() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const items = gridRef.current.querySelectorAll('.partner-item')
    const ctx = gsap.context(() => {
      gsap.set(items, { y: 20, opacity: 0 })
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'expo.out' })
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section zone" id="partners" aria-labelledby="partners-title" style={{ padding: 'var(--sp-6) 0' }}>
      <div className="container">
        <header className="section-head" style={{ marginBottom: 'var(--sp-5)' }}>
          <h2 id="partners-title" className="section-head__title" style={{ fontSize: 'var(--fs-h2)' }}><span className="section-head__prefix">⌁</span> 合作伙伴</h2>
          <p className="section-head__sub">与优秀团队共同成长</p>
        </header>

        <div ref={gridRef} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)',
          justifyContent: 'center',
        }}>
          {partners.map(p => (
            <div key={p.name} className="partner-item" style={{
              background: 'var(--c-panel)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-pill)',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--c-accent)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--c-line)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            >
              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-txt)' }}>{p.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--c-txt-3)', fontFamily: 'var(--font-mono)' }}>{p.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
