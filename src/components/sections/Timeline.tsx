import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const milestones = [
  { year: '2024', title: '工作室成立', desc: '屿作所正式成立，开始提供数字产品设计与开发服务', icon: '🚀' },
  { year: '2024 Q2', title: '首个开源项目', desc: '发布 liquid-glass-react 组件库，GitHub Stars 突破 1k', icon: '📦' },
  { year: '2024 Q3', title: '团队扩展', desc: '团队扩展至 4 人，开始提供全栈开发服务', icon: '👥' },
  { year: '2024 Q4', title: '50+ 项目交付', desc: '累计交付 50+ 数字产品项目，客户满意度 98%', icon: '🎯' },
  { year: '2025 Q1', title: '液态玻璃技术栈', desc: '建立完整的液态玻璃视觉技术栈，hyalite.js v0.5.0 发布', icon: '💎' },
  { year: '2025 Q2', title: '开源贡献', desc: '向 Blender、Grafana 等开源项目提交 PR，累计 20+ 贡献', icon: '🌐' },
  { year: '2026', title: '官网 v2.0', desc: '全新品牌官网上线，液态玻璃视觉系统全面应用', icon: '✨' },
]

export default function Timeline() {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lineRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const items = lineRef.current.querySelectorAll('.timeline-item')
    const ctx = gsap.context(() => {
      gsap.set(items, { x: -30, opacity: 0 })
      ScrollTrigger.batch(items, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'expo.out' })
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section section--ink2 zone" id="timeline" aria-labelledby="timeline-title">
      <div className="container">
        <header className="section-head">
          <h2 id="timeline-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 发展历程</h2>
          <p className="section-head__sub">从成立到现在的每一步</p>
        </header>

        <div ref={lineRef} className="timeline">
          {milestones.map((m) => (
            <div key={m.year} className="timeline-item">
              <div className="timeline-item__dot" aria-hidden="true">
                <span>{m.icon}</span>
              </div>
              <div className="timeline-item__content">
                <span className="timeline-item__year">{m.year}</span>
                <h3 className="timeline-item__title">{m.title}</h3>
                <p className="timeline-item__desc">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
