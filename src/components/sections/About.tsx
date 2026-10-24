import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 不编人。只讲做事的方式。
const principles = [
  {
    mark: '01',
    title: '先对齐，再动手',
    desc: '需求、受众、验收标准三件事先讲清楚，再谈方案和报价。含糊的地方当场问，不带着假设开工。',
  },
  {
    mark: '02',
    title: '每周看得见',
    desc: '按周给出能点开的进度，不做黑盒，也不等到最后一天才交东西。方向偏了，当周就调。',
  },
  {
    mark: '03',
    title: '交付带文档',
    desc: '设计稿、组件说明、部署步骤一并留下。后续换人接手或自己改，不用靠猜。',
  },
  {
    mark: '04',
    title: '做不好就说不',
    desc: '能力之外的项目直接讲明，不硬接。接下的部分，负责到上线之后。',
  },
]

const facts = [
  { label: '服务范围', value: '品牌 · 界面 · 前端 · 动效' },
  { label: '交付周期', value: '4–12 周' },
  { label: '协作方式', value: '远程 · 全程可追' },
  { label: '技术栈', value: 'React 19 · Vite · GSAP' },
]

export default function About() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cards = gridRef.current.querySelectorAll('.team-card')
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
    <section className="section zone" id="about" aria-labelledby="about-title">
      <div className="container">
        <header className="section-head">
          <h2 id="about-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 关于我们</h2>
          <p className="section-head__sub">一间工作室，按项目组队</p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--sp-6)',
          marginBottom: 'var(--sp-6)',
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <p style={{
              fontSize: 'var(--fs-body-lg)',
              color: 'var(--c-txt-2)',
              lineHeight: 1.8,
              marginBottom: 'var(--sp-4)',
            }}>
              屿作所是一间小型数字产品工作室，做界面与前端。核心的人是固定的，
              其余按项目找长期合作的伙伴补位，不为撑场面养一支满编团队。
            </p>
            <p style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--c-txt-3)',
              lineHeight: 1.7,
            }}>
              接的项目主要集中在三块：品牌视觉与官网、需要动效的产品界面、以及把设计稿真正落地成能跑的前端。
              规模不大，所以每个项目都由实际动手的人直接对接，中间不隔一层项目经理。
            </p>
          </div>
          <div style={{
            background: 'var(--c-panel)',
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--sp-5)',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--c-txt)', marginBottom: 'var(--sp-3)' }}>工作室概况</h3>
            {facts.map(item => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--sp-3)',
                padding: 'var(--sp-2) 0',
                borderBottom: '1px solid var(--c-line)',
              }}>
                <span style={{ fontSize: '14px', color: 'var(--c-txt-3)', flexShrink: 0 }}>{item.label}</span>
                <span style={{ fontSize: '14px', color: 'var(--c-accent)', fontWeight: 600, textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--sp-4)',
        }}>
          {principles.map(item => (
            <div key={item.mark} className="team-card glass-float" style={{
              background: 'var(--c-panel)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--sp-5)',
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--r-md)',
                background: 'rgba(212, 255, 63, 0.12)',
                color: 'var(--c-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 15,
                fontFamily: 'var(--font-mono)',
                marginBottom: 'var(--sp-3)',
              }}>{item.mark}</div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-txt)', marginBottom: 'var(--sp-2)' }}>{item.title}</h4>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--c-txt-3)', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
