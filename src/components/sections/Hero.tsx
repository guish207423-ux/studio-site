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
      gsap.fromTo(panelRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div ref={panelRef} className="hero-panel" style={{
          borderRadius: 'var(--r-xl)',
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.035)',
          border: '1px solid var(--c-line)',
        }}>
          {/* Animated gradient accent line */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--c-accent), transparent)',
            animation: 'hero-accent-sweep 4s var(--ease-in-out-quart) infinite',
          }} />
          <p style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            marginBottom: 'var(--sp-4)',
          }}>
            <span className="pulse-dot" aria-hidden="true" />
            <span className="label">2026 Q4 档期可接新项目</span>
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
          }}>把设计稿做成能用的界面，看得见，也点得动。</p>
          <p style={{
            fontSize: 'var(--fs-body-sm)',
            color: 'var(--c-txt-3)',
            marginBottom: 'var(--sp-5)',
          }}>
            一个项目从头到尾由同一批人做完，不转包。页面上的玻璃是真在透背景，不是贴图。
          </p>
          <div className="hero-cta" style={{
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
          {/* Animated stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--sp-3)',
            marginBottom: 'var(--sp-4)',
            padding: 'var(--sp-4)',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--c-line)',
          }}>
            {[
              { value: '4–12', label: '周交付周期' },
              { value: '3', label: '类常见项目' },
              { value: '0', label: '转包' },
              { value: '24h', label: '内回复' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 900,
                  color: 'var(--c-txt)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}>{stat.value}</p>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--c-txt-2)',
                  letterSpacing: '0.04em',
                }}>{stat.label}</p>
              </div>
            ))}
          </div>
          {[
            { dt: '协作方式', dd: '远程 · 每周可见' },
            { dt: '源码归属', dd: '全部交付给你' },
            { dt: '缺陷修复', dd: '上线后 30 天' },
            { dt: '交付物', dd: '代码 + 使用文档' },
            { dt: '付款节奏', dd: '按里程碑分三次' },
            { dt: '无障碍', dd: 'WCAG AA 基线' },
          ].map(item => (
            <dl key={item.dt} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--sp-3) 0',
              borderBottom: '1px solid var(--c-line)',
            }}>
              <dt style={{ fontSize: '14px', color: 'var(--c-txt-2)' }}>{item.dt}</dt>
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
