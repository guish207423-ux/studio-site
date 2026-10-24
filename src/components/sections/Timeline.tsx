import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 不编发展史。这里是一个 6 周项目实际的推进节奏。
const milestones = [
  { year: '第 1 周', title: '对齐与拆解', desc: '需求、受众、验收标准三件事定下来，拆成可排期的任务清单。', icon: '①' },
  { year: '第 2 周', title: '方向与原型', desc: '先出两三个方向，确认一个之后再往下做，不在错的方向上堆时间。', icon: '②' },
  { year: '第 3–4 周', title: '设计与实现并行', desc: '页面往下推的同时，前端把骨架和组件搭起来，不等设计全定稿。', icon: '③' },
  { year: '第 5 周', title: '联调与打磨', desc: '动效、响应式、无障碍逐项过一遍，性能和加载也在这周收尾。', icon: '④' },
  { year: '第 6 周', title: '上线与交接', desc: '部署、域名与证书配好，交付文档，30 天缺陷修复期从这天开始。', icon: '⑤' },
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
          <h2 id="timeline-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 项目怎么推进</h2>
          <p className="section-head__sub">以 6 周的项目为例，实际大概是这个节奏</p>
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
