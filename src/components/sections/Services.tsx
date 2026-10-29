import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PenTool, Brush, Code, VideoPlay, Mobile, Command, GlobalSearch, Cpu } from 'iconsax-react'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const services = [
  { icon: PenTool, title: 'UI/UX 设计', desc: '界面设计与交互原型，从需求到可点击原型', tags: ['交互设计', '设计系统'], span: 'bento-lg' },
  { icon: Brush, title: '品牌 VI 设计', desc: '品牌识别系统与视觉规范定义', tags: ['标志系统', '视觉规范'], span: 'bento-sm' },
  { icon: Code, title: '前端/全栈开发', desc: '设计稿落地为可维护的生产代码', tags: ['React / TS', '性能优化'], span: 'bento-sm' },
  { icon: VideoPlay, title: '动效与视频', desc: '交互动效、WebGL 与视频内容制作', tags: ['GSAP', '3D'], span: 'bento-wide' },
  { icon: Mobile, title: 'App 开发', desc: '原生与跨平台移动应用开发', tags: ['iOS', 'Android'], span: 'bento-sm' },
  { icon: Command, title: '自动化脚本', desc: '工作流自动化与数据处理脚本', tags: ['Python', 'Shell'], span: 'bento-sm' },
  { icon: GlobalSearch, title: '数据采集', desc: '大规模数据采集与反爬策略', tags: ['分布式', '反爬'], span: 'bento-sm' },
  { icon: Cpu, title: 'AI Agent 开发', desc: 'LLM 应用与 Agent 系统开发', tags: ['LLM', '工具链'], span: 'bento-sm' },
]

export default function Services() {
  const gridRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!gridRef.current || reduced) return

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

    // Spotlight border tracking
    const handleMouseMove = (e: MouseEvent) => {
      const card = (e.currentTarget as HTMLElement)
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      card.style.setProperty('--spotlight-x', `${x}px`)
      card.style.setProperty('--spotlight-y', `${y}px`)
    }
    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove as EventListener)
    })

    return () => {
      ctx.revert()
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove as EventListener)
      })
    }
  }, [reduced])

  return (
    <section className="section zone" id="services" aria-labelledby="services-title">
      <div className="container">
        <header className="section-head">
          <h2 id="services-title" className="section-head__title">服务范围</h2>
          <p className="section-head__sub"><SectionIcon name="services" size={16} /> 八项核心服务能力，可单独委托或组合交付</p>
        </header>

        <div ref={gridRef} className="services-bento">
          {services.map(s => {
            const Icon = s.icon
            return (
            <article key={s.title} className={`service-card glass-float spotlight-card ${s.span}`}>
              <span className="service-card__icon" aria-hidden="true">
                <Icon size={32} strokeWidth={1.5} />
              </span>
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
              <div className="service-card__tags">
                {s.tags.map(t => (
                  <span key={t} className="service-card__tag">{t}</span>
                ))}
              </div>
            </article>
            )
          })}
        </div>

        <div className="section-foot">
          <a href="#contact" className="btn btn--lg btn--primary glass-btn">
            <span>联系我们</span>
          </a>
          <p className="section-foot__sub">8 项服务 · 支持单独委托或组合交付 · 全程远程协作</p>
        </div>
      </div>
    </section>
  )
}
