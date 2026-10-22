import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const cases = [
  {
    title: '液态玻璃组件库',
    client: 'Nous Research',
    category: 'UI 组件',
    desc: '为 AI 研究机构构建 React 液态玻璃组件库，SVG feDisplacementMap 驱动真实折射效果，支持 5 种玻璃变体，全站 10+ 实例。',
    metrics: [{ label: '组件数', value: '12' }, { label: 'GitHub Stars', value: '4.2k' }, { label: '周下载', value: '8.5k' }],
    tags: ['React', 'TypeScript', 'SVG', 'WebGL'],
    color: '#D4FF3F',
  },
  {
    title: '数据可视化平台',
    client: 'Grafana Labs',
    category: '数据可视化',
    desc: '基于 Grafana 开源内核的定制可视化平台，实时数据监控、自定义仪表盘、告警系统，支持 100+ 数据源接入。',
    metrics: [{ label: '数据源', value: '100+' }, { label: '仪表盘', value: '500+' }, { label: '用户', value: '12k' }],
    tags: ['React', 'TypeScript', 'Go', 'PostgreSQL'],
    color: '#7FE3FF',
  },
  {
    title: '3D 创作工具链',
    client: 'Blender Foundation',
    category: '3D 创作',
    desc: 'Blender 工作流优化与插件开发，涵盖建模自动化、渲染管线优化、资产管理系统，提升团队协作效率 40%。',
    metrics: [{ label: '插件数', value: '8' }, { label: '效率提升', value: '40%' }, { label: '用户', value: '3k' }],
    tags: ['Python', 'C++', 'Blender API', 'Qt'],
    color: '#B47FFF',
  },
]

export default function CaseStudies() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cards = gridRef.current.querySelectorAll('.case-card')
    const ctx = gsap.context(() => {
      gsap.set(cards, { y: 40, opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'expo.out' })
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section zone" id="cases" aria-labelledby="cases-title">
      <div className="container">
        <header className="section-head">
          <h2 id="cases-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 案例研究</h2>
          <p className="section-head__sub">深度项目拆解 · 从问题到交付</p>
        </header>

        <div ref={gridRef} className="cases-grid">
          {cases.map((c) => (
            <article key={c.title} className="case-card glass-float" style={{ cursor: 'default' }}>
              <div className="case-card__header">
                <span className="case-card__category" style={{ color: c.color }}>{c.category}</span>
                <span className="case-card__client">{c.client}</span>
              </div>
              <h3 className="case-card__title">{c.title}</h3>
              <p className="case-card__desc">{c.desc}</p>
              <div className="case-card__metrics">
                {c.metrics.map(m => (
                  <div key={m.label} className="case-card__metric">
                    <span className="case-card__metric-value" style={{ color: c.color }}>{m.value}</span>
                    <span className="case-card__metric-label">{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="case-card__tags">
                {c.tags.map(t => (
                  <span key={t} className="case-card__tag">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
