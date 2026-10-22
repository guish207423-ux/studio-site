import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { num: '01', title: '需求对齐', desc: '深度沟通项目目标、受众与期望，输出需求文档' },
  { num: '02', title: '方案设计', desc: '品牌策略、视觉方向、交互原型，多轮迭代确认' },
  { num: '03', title: '开发实现', desc: '前端/后端/动效全栈开发，持续预览与反馈' },
  { num: '04', title: '测试验收', desc: '多端测试、性能调优、无障碍检查，确保质量' },
  { num: '05', title: '交付上线', desc: '部署、文档、培训，全程可追，持续支持' },
]

export default function Process() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const items = gridRef.current.querySelectorAll('.process-step')
    const ctx = gsap.context(() => {
      gsap.set(items, { y: 40, opacity: 0 })
      ScrollTrigger.batch(items, {
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
    <section className="section zone" id="process" aria-labelledby="process-title">
      <div className="container">
        <header className="section-head">
          <h2 id="process-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 工作流程</h2>
          <p className="section-head__sub">从需求到交付，全程透明可追</p>
        </header>

        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--sp-4)',
        }}>
          {steps.map((step, i) => (
            <div key={step.num} className="process-step glass-float" style={{
              background: 'var(--c-panel)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--sp-5)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div aria-hidden="true" style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-var(--sp-4)',
                  width: 'var(--sp-4)',
                  height: '1px',
                  background: 'var(--c-line-strong)',
                  display: 'none',
                }} />
              )}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '48px',
                fontWeight: 900,
                color: 'var(--c-accent)',
                opacity: 0.15,
                lineHeight: 1,
                position: 'absolute',
                top: 'var(--sp-3)',
                right: 'var(--sp-3)',
              }}>{step.num}</span>
              <h3 style={{
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--c-txt)',
                marginBottom: 'var(--sp-2)',
                position: 'relative',
              }}>{step.title}</h3>
              <p style={{
                fontSize: 'var(--fs-body-sm)',
                color: 'var(--c-txt-2)',
                lineHeight: 1.7,
                position: 'relative',
              }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
