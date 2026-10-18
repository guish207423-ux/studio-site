import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    name: 'liquid-glass-react',
    desc: 'React 液态玻璃组件库，SVG feDisplacementMap 驱动',
    tags: ['React', 'TypeScript', 'SVG', 'WebGL'],
    stars: '4.2k',
    license: 'MIT',
    video: './videos/liquid-glass-react.webm',
    poster: './videos/liquid-glass-react-poster.jpg',
    github: 'https://github.com/nousresearch/liquid-glass-react',
    demo: 'https://www.nousresearch.com',
  },
  {
    name: 'Blender',
    desc: '开源 3D 创作套件，建模 / 动画 / 渲染全流程',
    tags: ['3D', '建模', '渲染'],
    stars: '12.3k',
    license: 'GPL',
    video: './videos/blender.webm',
    poster: './videos/blender-poster.jpg',
    github: 'https://github.com/blender/blender',
    demo: 'https://www.blender.org',
  },
  {
    name: 'Grafana',
    desc: '开放可视化平台，实时数据监控与仪表盘',
    tags: ['TypeScript', 'React', '可视化'],
    stars: '68.1k',
    license: 'AGPL',
    video: './videos/grafana.webm',
    poster: './videos/grafana-poster.jpg',
    github: 'https://github.com/grafana/grafana',
    demo: 'https://grafana.com',
  },
  {
    name: 'Audacity',
    desc: '开源音频编辑器，多轨录制与波形处理',
    tags: ['C++', '音频', '多轨'],
    stars: '12.8k',
    license: 'GPL',
    video: './videos/audacity.webm',
    poster: './videos/audacity-poster.jpg',
    github: 'https://github.com/audacity/audacity',
    demo: 'https://www.audacityteam.org',
  },
  {
    name: 'Penpot',
    desc: '开源设计协作工具，矢量原型与交付',
    tags: ['Clojure', 'SVG', '协作'],
    stars: '31.5k',
    license: 'AGPL',
    video: './videos/penpot.webm',
    poster: './videos/penpot-poster.jpg',
    github: 'https://github.com/penpot/penpot',
    demo: 'https://penpot.app',
  },
  {
    name: 'OpenShot',
    desc: '开源视频编辑器，多轨时间线剪辑',
    tags: ['Python', 'Qt', '视频'],
    stars: '5.2k',
    license: 'GPL',
    video: './videos/openshot.webm',
    poster: './videos/openshot-poster.jpg',
    github: 'https://github.com/OpenShot/openshot-qt',
    demo: 'https://www.openshot.org',
  },
]

export default function Works() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const videos = gridRef.current.querySelectorAll<HTMLVideoElement>('video[data-hover-play]')
    let activeVideo: HTMLVideoElement | null = null

    videos.forEach(v => {
      v.preload = 'metadata'
      v.muted = true
      v.loop = true
      v.playsInline = true

      const card = v.closest('.work-card')
      if (!card) return

      const playVideo = () => {
        if (activeVideo && activeVideo !== v) {
          activeVideo.pause()
        }
        v.play().catch(() => {})
        activeVideo = v
      }
      const pauseVideo = () => {
        v.pause()
        if (activeVideo === v) activeVideo = null
      }

      if (!reduced) {
        card.addEventListener('mouseenter', playVideo)
        card.addEventListener('mouseleave', pauseVideo)
      }

      card.addEventListener('click', () => {
        if (v.paused) playVideo()
        else pauseVideo()
      })
    })

    return () => {
      videos.forEach(v => {
        const card = v.closest('.work-card')
        if (!card) return
        card.replaceWith(card.cloneNode(true))
      })
    }
  }, [])

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cards = gridRef.current.querySelectorAll('.work-card')
    const ctx = gsap.context(() => {
      gsap.set(cards, { y: 40, opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'expo.out' })
        },
      })
      const ticker = () => {
        cards.forEach((el) => {
          const rect = el.getBoundingClientRect()
          if (rect.bottom < window.innerHeight) {
            const opacity = parseFloat(getComputedStyle(el).opacity)
            if (opacity < 1) gsap.set(el, { opacity: 1, y: 0 })
          }
        })
      }
      gsap.ticker.add(ticker)
      return () => { gsap.ticker.remove(ticker) }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section section--ink2 zone" id="works" aria-labelledby="works-title">
      <div className="container">
        <header className="section-head">
          <h2 id="works-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 作品展示</h2>
          <p className="section-head__sub">开源项目编排</p>
        </header>

        <div ref={gridRef} className="works-grid">
          {projects.map((p) => (
            <article key={p.name} className="work-card" style={{
              background: 'var(--c-panel)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-line)',
              overflow: 'hidden',
              transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'var(--c-panel-2)'
              el.style.borderColor = 'var(--c-line-strong)'
              el.style.boxShadow = 'var(--sh-2)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'var(--c-panel)'
              el.style.borderColor = 'var(--c-line)'
              el.style.boxShadow = 'var(--sh-1)'
            }}
            >
              {/* Preview area with real video */}
              <div className="work-card__preview" style={{
                aspectRatio: '16 / 9',
                borderBottom: '1px solid var(--c-line)',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: 'var(--r-md) var(--r-md) 0 0',
              }}>
                <video
                  data-hover-play
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={p.poster}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                >
                  <source src={p.video} type="video/webm" />
                </video>
                <span className="work-card__hint" style={{
                  position: 'absolute',
                  bottom: 'var(--sp-3)',
                  right: 'var(--sp-3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--c-txt-3)',
                  background: 'rgba(5,5,5,0.7)',
                  padding: '4px 10px',
                  borderRadius: 'var(--r-pill)',
                  pointerEvents: 'none',
                  transition: 'opacity 0.3s ease',
                }}>悬停播放</span>
              </div>

              {/* Content */}
              <div style={{ padding: 'var(--sp-4)' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--sp-2)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'var(--c-txt)',
                  }}>{p.name}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--c-txt-3)',
                  }}>⭐ {p.stars} · {p.license}</span>
                </div>
                <p style={{
                  fontSize: 'var(--fs-body-sm)',
                  color: 'var(--c-txt-2)',
                  marginBottom: 'var(--sp-3)',
                  lineHeight: 1.7,
                }}>{p.desc}</p>
                <div style={{
                  display: 'flex',
                  gap: 'var(--sp-2)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--sp-3)',
                }}>
                  {p.tags.map(t => (
                    <span key={t} style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--c-txt-3)',
                      background: 'var(--c-panel-2)',
                      padding: '4px 12px',
                      borderRadius: 'var(--r-pill)',
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  gap: 'var(--sp-3)',
                }}>
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--ghost" style={{ textDecoration: 'none' }}>
                    GitHub
                  </a>
                  <a href={p.demo} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--ghost" style={{ textDecoration: 'none' }}>
                    在线演示
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}