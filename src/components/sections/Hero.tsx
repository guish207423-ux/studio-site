import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../lib/motion'

export default function Hero() {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!panelRef.current || reduced) return
    // 静态壳已经把这段标题画在屏幕上了，再跑一次 y:40/opacity:0 入场 = 内容闪一下再回来。
    if ((window as any).__HAS_STATIC_SHELL__) return
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })
    })
    return () => ctx.revert()
  }, [reduced])

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container">
        <div ref={panelRef} className="hero-editorial">
          <p className="hero-eyebrow">屿作所 · Yu Studio</p>
          <h1 id="hero-title" className="hero-title-editorial">
            我们把设计<br />
            变成能运行的<br />
            <span className="hero-title-accent">产品</span>
          </h1>
          <p className="hero-lead-editorial">
            品牌官网、动效界面、设计稿落地——从设计到代码，全程一个团队。
          </p>
          <div className="hero-cta-editorial">
            <a href="#contact" className="btn btn--lg btn--primary">
              <span>预约咨询</span>
            </a>
            <a href="#works" className="btn btn--lg btn--ghost">
              <span>查看案例 →</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
