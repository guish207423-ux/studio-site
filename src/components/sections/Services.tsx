import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PenTool, Brush, Code, VideoPlay, Mobile, Command, GlobalSearch, Cpu } from 'iconsax-react'

gsap.registerPlugin(ScrollTrigger)

const services = [
  { icon: PenTool, title: 'UI/UX 设计', desc: '从用户研究到高保真原型的全流程界面设计', tags: ['交互原型', '设计系统'] },
  { icon: Brush, title: '品牌 VI 设计', desc: '品牌识别系统、视觉语言定义、设计规范', tags: ['标志系统', '视觉规范'] },
  { icon: Code, title: '前端/全栈开发', desc: '现代前端架构、性能调优、全栈交付', tags: ['React / TS', '性能优化'] },
  { icon: VideoPlay, title: '动效与视频', desc: '交互动效、WebGL 3D、视频制作', tags: ['GSAP', '3D'] },
  { icon: Mobile, title: 'App 开发', desc: '原生与跨平台 App 开发', tags: ['iOS', 'Android'] },
  { icon: Command, title: '自动化脚本', desc: '工作流自动化、数据处理脚本', tags: ['Python', 'Shell'] },
  { icon: GlobalSearch, title: '爬虫', desc: '大规模数据采集、反爬策略', tags: ['分布式', '反爬对抗'] },
  { icon: Cpu, title: 'Agent 开发', desc: 'AI Agent 设计、LLM 应用开发', tags: ['LLM', '工具链'] },
]

export default function Services() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cards = gridRef.current.querySelectorAll('.service-card')
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'expo.out' })
        },
      })
      gsap.set(cards, { y: 40, opacity: 0 })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section zone" id="services" aria-labelledby="services-title">
      <div className="container">
        <header className="section-head">
          <h2 id="services-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 服务能力</h2>
          <p className="section-head__sub">全谱系数字产品服务</p>
        </header>

        <div ref={gridRef} className="services-grid">
          {services.map(s => {
            const Icon = s.icon
            return (
            <article key={s.title} className="service-card" style={{
              background: 'var(--c-panel)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-line)',
              padding: 'var(--sp-5)',
              transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'var(--c-panel-2)'
              el.style.borderColor = 'var(--c-line-strong)'
              el.style.boxShadow = 'var(--sh-2)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'var(--c-panel)'
              el.style.borderColor = 'var(--c-line)'
              el.style.boxShadow = 'var(--sh-1)'
            }}
            >
              <span aria-hidden="true" style={{
                display: 'inline-flex',
                color: 'var(--c-accent)',
                marginBottom: 'var(--sp-3)',
              }}><Icon size={32} strokeWidth={1.5} /></span>
              <h3 style={{
                fontWeight: 700,
                fontSize: '20px',
                color: 'var(--c-txt)',
                marginBottom: 'var(--sp-2)',
              }}>{s.title}</h3>
              <p style={{
                fontSize: 'var(--fs-body-sm)',
                color: 'var(--c-txt-2)',
                marginBottom: 'var(--sp-3)',
                lineHeight: 1.7,
              }}>{s.desc}</p>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                {s.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--c-txt-3)',
                    background: 'var(--c-panel-2)',
                    padding: '4px 12px',
                    borderRadius: 'var(--r-pill)',
                  }}>{t}</span>
                ))}
              </div>
            </article>
            )
          })}
        </div>

        <div style={{
          marginTop: 'var(--sp-6)',
          textAlign: 'center',
        }}>
          <a href="#contact" className="btn btn--lg btn--primary glass-btn">
            <span>开始一个项目</span>
          </a>
          <p style={{
            fontSize: '14px',
            color: 'var(--c-txt-3)',
            marginTop: 'var(--sp-3)',
          }}>8 项服务 · 单次委托可覆盖多项 · 全程远程可追</p>
        </div>
      </div>
    </section>
  )
}
