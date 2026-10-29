import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const cases = [
  {
    title: '品牌官网 / 产品落地页',
    category: '官网',
    scene: '适合：刚起步的团队、独立产品',
    desc: '从一个还说不清的方向开始，把品牌调性、页面结构和文案一起定下来，做成能直接上线的官网。不做模板套壳，也不堆无用的动画。',
    deliverables: [
      { value: '视觉', label: '一套可延展的方向' },
      { value: '前端', label: '响应式 + 无障碍' },
      { value: '上线', label: '域名 · 证书 · 部署' },
    ],
    tags: ['React', 'Vite', 'GSAP', '响应式'],
  },
  {
    title: '产品界面的动效升级',
    category: '界面动效',
    scene: '适合：已有产品，想让质感再往上走',
    desc: '在现有产品里补上动效与玻璃质感：先定一套动效规则，再做成能复用的组件。重点是让交互更清楚，而不是为了炫技到处加动画。',
    deliverables: [
      { value: '规范', label: '动效与时长规则' },
      { value: '组件', label: '可复用，不写死' },
      { value: '性能', label: '帧预算内运行' },
    ],
    tags: ['React', 'TypeScript', 'SVG', 'CSS'],
  },
  {
    title: '设计稿落地 / 前端重构',
    category: '前端',
    scene: '适合：有设计稿，但要真正跑起来',
    desc: '把设计稿变成可维护的代码：组件拆分、状态处理、响应式适配、无障碍检查。接手别人留下的老项目时，先补测试和文档再动刀。',
    deliverables: [
      { value: '拆件', label: '组件化，不重复' },
      { value: '适配', label: '手机 / 平板 / 桌面' },
      { value: '交接', label: '文档 + 部署说明' },
    ],
    tags: ['React', 'TypeScript', 'Vite', 'WCAG'],
  },
]

export default function CaseStudies() {
  const gridRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!gridRef.current || reduced) return

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
  }, [reduced])

  return (
    <section className="section zone" id="cases" aria-labelledby="cases-title">
      <div className="container">
        <header className="section-head">
          <h2 id="cases-title" className="section-head__title">做过哪些项目</h2>
          <p className="section-head__sub"><SectionIcon name="cases" size={16} /> 三种我们常接的活，以及怎么拆</p>
        </header>

        {/* polish-round3 §三：等宽卡片网格 → 交错双栏。
            每条占一整行、内部两栏；奇数行文字在左、偶数行左右互换（CSS nth-child 翻转）。
            这里没有配图，所以「图」位放的是该场景的交付物清单，仍然是文字，不假装有图。 */}
        <div ref={gridRef} className="cases-grid">
          {cases.map((c) => (
            <article key={c.title} className="case-card" style={{ cursor: 'default' }}>
              <div className="case-card__text">
                <span className="case-card__category">{c.category}</span>
                <h3 className="case-card__title">{c.title}</h3>
                <p className="case-card__desc">{c.desc}</p>
                <div className="case-card__tags">
                  {c.tags.map(t => (
                    <span key={t} className="case-card__tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="case-card__aside">
                <span className="case-card__client">{c.scene}</span>
                <div className="case-card__metrics">
                  {c.deliverables.map(m => (
                    <div key={m.value} className="case-card__metric">
                      <span className="case-card__metric-value">{m.value}</span>
                      <span className="case-card__metric-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
