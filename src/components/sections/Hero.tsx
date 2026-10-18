import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero() {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!panelRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })

      if (titleRef.current) {
        // SplitText: split the Chinese title into per-character spans
        const titleEl = titleRef.current
        const chineseText = titleEl.childNodes[1] // text node "屿作所"
        if (chineseText && chineseText.nodeType === Node.TEXT_NODE) {
          const text = chineseText.textContent || ''
          const chars = text.split('')
          const fragment = document.createDocumentFragment()
          chars.forEach((ch) => {
            const span = document.createElement('span')
            span.textContent = ch
            span.style.display = 'inline-block'
            fragment.appendChild(span)
          })
          titleEl.replaceChild(fragment, chineseText)

          // Animate each char
          const charSpans = titleEl.querySelectorAll('span[style*="inline-block"]')
          gsap.fromTo(charSpans, 
            { y: 40, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.2, stagger: 0.08 }
          )
        }
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" aria-labelledby="hero-title" style={{
      padding: 'calc(72px + var(--sp-7)) 0 var(--sp-7)',
      position: 'relative',
      zIndex: 1,
    }}>
      <div className="container hero-grid">
        <div ref={panelRef} className="glass glass-hero" style={{
          borderRadius: 'var(--r-xl)',
        }}>
          <p style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            marginBottom: 'var(--sp-4)',
          }}>
            <span className="pulse-dot" aria-hidden="true" />
            <span className="label">接受委托 · 2026 Q4</span>
          </p>
          <h1 ref={titleRef} id="hero-title" style={{
            fontWeight: 900,
            fontSize: 'var(--fs-display)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: 'var(--c-txt)',
            marginBottom: 'var(--sp-4)',
          }}>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontSize: '0.35em',
              letterSpacing: '0',
              color: 'var(--c-accent)',
              marginBottom: 'var(--sp-2)',
            }}>Yu Studio</span>
            屿作所
          </h1>
          <p style={{
            fontSize: 'var(--fs-body-lg)',
            lineHeight: 1.65,
            color: 'var(--c-txt-2)',
            marginBottom: 'var(--sp-3)',
          }}>以光学与形变，构建数字产品的视觉语言。</p>
          <p style={{
            fontSize: 'var(--fs-body-sm)',
            color: 'var(--c-txt-3)',
            marginBottom: 'var(--sp-5)',
          }}>
            从品牌识别到前端交付，一次到位。液态玻璃视觉由成熟折射引擎驱动，全站 5 个玻璃实例，参数经 A/B 差分验证。
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--sp-3)',
            flexWrap: 'wrap',
          }}>
            <a href="#works" className="btn btn--lg btn--primary">
              <span>查看作品</span>
            </a>
            <a href="#services" className="btn btn--lg btn--secondary">
              服务能力
            </a>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-4)',
          paddingTop: 'var(--sp-4)',
        }}>
          {[
            { dt: '交付周期', dd: '4 – 12 周' },
            { dt: '协作模式', dd: '远程 · 全程可追' },
            { dt: '玻璃实例', dd: '5 / 5 上限' },
            { dt: '折射引擎', dd: 'hyalite.js v0.5.0' },
            { dt: '性能预算', dd: '20ms / 帧上限' },
            { dt: '无障碍', dd: 'WCAG AA' },
          ].map(item => (
            <dl key={item.dt} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--sp-3) 0',
              borderBottom: '1px solid var(--c-line)',
            }}>
              <dt style={{ fontSize: '14px', color: 'var(--c-txt-3)' }}>{item.dt}</dt>
              <dd style={{ fontSize: '14px', color: 'var(--c-txt)', fontWeight: 500 }}>{item.dd}</dd>
            </dl>
          ))}
        </div>
      </div>

      <div aria-hidden="true" style={{
        position: 'absolute',
        bottom: 'var(--sp-5)',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
      }}>
        <span className="label">Scroll</span>
        <span className="scroll-cue__line" />
      </div>
    </section>
  )
}
