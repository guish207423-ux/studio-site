import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: '01',
    title: '对齐与报价',
    time: '1–3 天',
    desc: '聊清目标、预算和上线时间，出一页需求说明 + 分项报价。不签就不往下走。',
    need: '你需要：说清要解决什么问题，谁能拍板。',
  },
  {
    num: '02',
    title: '结构与线框',
    time: '第 1 周',
    desc: '定页面清单、内容结构和线框。这一步改结构最便宜，之后改就要动设计稿了。',
    need: '你需要：确认页面范围，指定内容由谁提供。',
  },
  {
    num: '03',
    title: '视觉定稿',
    time: '第 2–3 周',
    desc: '首页与内页视觉稿，含动效说明。修改按轮计，一轮内意见请一次给全。',
    need: '你需要：一次性给出完整修改意见。',
  },
  {
    num: '04',
    title: '前端实现',
    time: '第 3–5 周',
    desc: '可访问的预览链接，每周更新一次。你在预览上直接标问题，不用等邮件。',
    need: '你需要：每周花半小时看预览并反馈。',
  },
  {
    num: '05',
    title: '上线交付',
    time: '第 6 周',
    desc: '部署上线，交付源码和使用文档，附 30 天缺陷修复。之后要不要维护，你定。',
    need: '你需要：提供域名、服务器或第三方账号。',
  },
]

export default function Process() {
  const gridRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!gridRef.current || reduced) return

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
  }, [reduced])

  return (
    <section className="section zone" id="process" aria-labelledby="process-title">
      <div className="container">
        <header className="section-head">
          <h2 id="process-title" className="section-head__title">工作流程</h2>
          <p className="section-head__sub"><SectionIcon name="process" size={16} /> 按 4–6 周的官网重做排；转前端压到 2–3 周</p>
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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)', position: 'relative' }}>
                <h3 style={{
                  fontWeight: 700,
                  fontSize: '18px',
                  color: 'var(--c-txt)',
                }}>{step.title}</h3>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--c-txt-3)',
                  whiteSpace: 'nowrap',
                }}>{step.time}</span>
              </div>
              <p style={{
                fontSize: 'var(--fs-body-sm)',
                color: 'var(--c-txt-2)',
                lineHeight: 1.7,
                position: 'relative',
              }}>{step.desc}</p>
              <p style={{
                fontSize: '13px',
                color: 'var(--c-txt-3)',
                lineHeight: 1.6,
                marginTop: 'var(--sp-3)',
                paddingTop: 'var(--sp-3)',
                borderTop: '1px solid var(--c-line)',
                position: 'relative',
              }}>{step.need}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
