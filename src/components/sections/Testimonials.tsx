import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

// 不放编造的客户评价。改成交付承诺——这些是我们真的愿意写进合作里的条件。
const commitments = [
  {
    mark: '价',
    title: '报价写死',
    tag: '固定总价 · 变更另算',
    text: '开始前给一份明确的报价和范围。中途加需求，先加钱再干活，不搞做完再补单。',
  },
  {
    mark: '周',
    title: '每周能看',
    tag: '可点开的进度',
    text: '每周一次能实际点开的预览，不是截图。方向不对，当周就能改，不用等到验收才发现。',
  },
  {
    mark: '源',
    title: '源码归你',
    tag: '源码 · 文档 · 部署说明',
    text: '交付时把源码、组件说明和部署步骤一起给。你随时能自己维护，也能交给别人接手。',
  },
  {
    mark: '修',
    title: '上线后还管',
    tag: '30 天缺陷修复',
    text: '上线后 30 天内，属于原本范围的 bug 免费修。超出范围的改动按实际工作量另算。',
  },
  {
    mark: '人',
    title: '不转包',
    tag: '对接的人就是干活的人',
    text: '和你沟通的人就是动手的人，中间不隔一层。有问题当场能解释清楚，不用来回传话。',
  },
  {
    mark: '止',
    title: '做不了就说',
    tag: '能力之外不硬接',
    text: '评估后觉得做不好，会直接讲明原因，也会说清楚谁能做。不为了签单硬接下来。',
  },
]

export default function Testimonials() {
  const gridRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!gridRef.current || reduced) return

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
  }, [reduced])

  return (
    <section className="section zone" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <header className="section-head">
          <h2 id="testimonials-title" className="section-head__title">交付承诺</h2>
          <p className="section-head__sub"><SectionIcon name="testimonials" size={16} /> 愿意写进合作里的条件，不是口号</p>
        </header>

        <div ref={gridRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--sp-4)',
        }}>
          {commitments.map(item => (
            <div key={item.title} className="testimonial-card glass-float" style={{
              background: 'var(--c-panel)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--sp-5)',
              position: 'relative',
            }}>
              <div style={{
                fontSize: '40px',
                color: 'var(--c-accent)',
                opacity: 0.18,
                lineHeight: 1,
                position: 'absolute',
                top: 'var(--sp-3)',
                right: 'var(--sp-4)',
                fontFamily: 'var(--font-display)',
              }}>{item.mark}</div>
              <p style={{
                fontSize: 'var(--fs-body)',
                color: 'var(--c-txt-2)',
                lineHeight: 1.7,
                marginBottom: 'var(--sp-4)',
                position: 'relative',
                zIndex: 1,
              }}>{item.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(212, 255, 63, 0.12)',
                  color: 'var(--c-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                }}>{item.mark}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-txt)' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--c-txt-3)' }}>{item.tag}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
