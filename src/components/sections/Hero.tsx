import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../../lib/motion'
import HeroSpecimen from '../ui/HeroSpecimen'

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
          {/* 原为三行、末行只有「产品」二字（占最长行 33%，390 档 21%）= 悬垂孤行；
              accent 又压在这两个泛词上，是全站最重的视觉资源标了信息量最低的词。
              改成两行、accent 落在动词短语上，最长/最短行 ≈ 1.17。 */}
          <h1 id="hero-title" className="hero-title-editorial">
            我们把设计变成<br />
            <span className="hero-title-accent">能运行的产品</span>
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
          {/* 首屏右侧原来是 384px 空白，整屏只剩「大标题 + 按钮」——AI 落地页的标准构图。
              这里补一个可自证的视觉锚点：真实 CSS 片段 ↔ 它渲染出的按钮。 */}
          <HeroSpecimen />
        </div>
      </div>
    </section>
  )
}
