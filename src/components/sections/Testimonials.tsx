import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  { name: 'Alex Chen', role: 'Product Lead, NovaTech', text: '屿作所的交付质量超出预期，玻璃动效与交互细节让产品体验提升了一个档次。' },
  { name: 'Sarah Lin', role: 'Founder, Lumina Studio', text: '从品牌 VI 到前端落地，全程高效。设计系统文档完善，后续迭代成本大幅降低。' },
  { name: 'Marcus Wei', role: 'CTO, DataPulse', text: '技术栈现代，代码质量高，性能优化到位。团队沟通顺畅，交付准时。' },
  { name: 'Emily Zhang', role: 'Design Director, PixelCraft', text: '对开源生态的编排能力令人印象深刻。液态玻璃组件库的 API 设计优雅，文档清晰。' },
  { name: 'David Liu', role: 'CEO, CloudMatrix', text: '全栈交付能力强大，从设计到部署一气呵成。性能预算控制严格，Lighthouse 全绿。' },
  { name: 'Nina Wang', role: 'PM, StreamFlow', text: '沟通透明，进度可追。每周更新让项目始终在可控范围内，最终交付超出预期。' },
]

export default function Testimonials() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cards = gridRef.current.querySelectorAll('.testimonial-card')
    const ctx = gsap.context(() => {
      gsap.set(cards, { y: 40, opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'expo.out' })
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section zone" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <header className="section-head">
          <h2 id="testimonials-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 客户评价</h2>
          <p className="section-head__sub">真实反馈，持续改进</p>
        </header>

        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--sp-4)',
        }}>
          {testimonials.map(t => (
            <div key={t.name} className="testimonial-card glass-float" style={{
              background: 'var(--c-panel)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--sp-5)',
              position: 'relative',
            }}>
              <div style={{
                fontSize: '48px',
                color: 'var(--c-accent)',
                opacity: 0.2,
                lineHeight: 1,
                position: 'absolute',
                top: 'var(--sp-3)',
                left: 'var(--sp-4)',
                fontFamily: 'var(--font-display)',
              }}>"</div>
              <p style={{
                fontSize: 'var(--fs-body)',
                color: 'var(--c-txt-2)',
                lineHeight: 1.7,
                marginBottom: 'var(--sp-4)',
                position: 'relative',
                zIndex: 1,
              }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--c-accent)',
                  color: 'var(--c-accent-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                }}>{t.name[0]}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-txt)' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--c-txt-3)', fontFamily: 'var(--font-mono)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
