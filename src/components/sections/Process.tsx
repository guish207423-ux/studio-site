import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion, useMediaQuery } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: '01',
    title: '需求确认',
    time: '1–3 天',
    desc: '明确项目目标、预算与上线时间，输出需求说明与分项报价。双方确认后进入下一阶段。',
    need: '客户需提供：业务目标与决策权限。',
  },
  {
    num: '02',
    title: '信息架构',
    time: '第 1 周',
    desc: '确定页面清单、内容结构与线框图。此阶段调整成本最低。',
    need: '客户需提供：页面范围与内容素材。',
  },
  {
    num: '03',
    title: '视觉设计',
    time: '第 2–3 周',
    desc: '首页与内页视觉稿，含动效说明。修改按轮计，每轮意见请一次性提交。',
    need: '客户需提供：完整修改意见。',
  },
  {
    num: '04',
    title: '前端开发',
    time: '第 3–5 周',
    desc: '提供可访问的预览链接，每周更新。客户可在预览上直接标注问题。',
    need: '客户需提供：每周预览反馈。',
  },
  {
    num: '05',
    title: '上线交付',
    time: '第 6 周',
    desc: '部署上线，交付源码与使用文档，附 30 天缺陷修复期。',
    need: '客户需提供：域名、服务器或第三方账号。',
  },
]

export default function Process() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()
  const [expanded, setExpanded] = useState<number | null>(null)
  // ≤767px 才是真折叠（CSS 同步：这档才有 max-height 过渡）；桌面端内容常驻展开。
  const isNarrow = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    if (!listRef.current || reduced) return

    const items = listRef.current.querySelectorAll('.process-step')
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
    // H2（评审）：原先 5 步各自「从下方 40px 淡入」，动效不携带任何信息。
    // 这里加一条滚动驱动的进度轨：滚动进入流程区时，左侧竖线按进度被 accent 填满，
    // 「5 步在推进」直接画出来。动效动词从「淡入」变成「推进」，且只在信息变化时出现。
    const railCtx = gsap.context(() => {
      gsap.fromTo(
        listRef.current,
        { '--fill': 0 },
        {
          '--fill': 1,
          ease: 'none',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 72%',
            end: 'bottom 65%',
            scrub: 0.4,
          },
        },
      )
    })
    return () => { ctx.revert(); railCtx.revert() }
  }, [reduced])

  return (
    <section className="section zone" id="process" aria-labelledby="process-title">
      <div className="container">
        <header className="section-head">
          <h2 id="process-title" className="section-head__title">项目流程</h2>
          <p className="section-head__sub"><SectionIcon name="process" size={16} /> 标准项目周期 4–6 周，可根据范围调整</p>
        </header>

        <ol ref={listRef} className="process-list">
          {steps.map((step, i) => {
            // 桌面端内容常驻展开：这个 button 没有可做的事（CSS 已 pointer-events:none），
            // 却仍占一个 Tab 停靠点 —— 实测 5 个「能聚焦、点不动」的停靠点。
            // 只在折叠真实存在的 ≤767px 档渲染成按钮，桌面端渲染同结构的静态 div。
            const inner = (
              <>
                <div className="process-step__head">
                  <h3 className="process-step__title">{step.title}</h3>
                  <span className="process-step__time">{step.time}</span>
                </div>
                <span className="process-step__chevron" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </>
            )
            return (
              <li key={step.num} className={`process-step${expanded === i ? ' process-step--expanded' : ''}`}>
                <span className="process-step__num" aria-hidden="true">{step.num}</span>
                <div className="process-step__content">
                  {isNarrow ? (
                    <button
                      type="button"
                      className="process-step__trigger"
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      aria-expanded={expanded === i}
                      aria-controls={`process-step-body-${i}`}
                    >{inner}</button>
                  ) : (
                    <div className="process-step__trigger">{inner}</div>
                  )}
                  <div
                    id={`process-step-body-${i}`}
                    className="process-step__body"
                  >
                    <p className="process-step__desc">{step.desc}</p>
                    <p className="process-step__need">{step.need}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
