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
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' })
        },
      })
      // 兜底：低帧率下掠过触发点的卡片会被永久留在 opacity: 0
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

        <div ref={gridRef} className="works-grid perspective-root">
          {projects.map((p) => (
            <article key={p.name} className="work-card glass-float">
              {/* Preview area with real video */}
              <div className="work-card__preview">
                <video
                  data-hover-play
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={p.poster}
                >
                  <source src={p.video} type="video/webm" />
                </video>
                <span className="work-card__hint">悬停播放</span>
              </div>

              {/* Content */}
              <div className="work-card__body">
                <div className="work-card__row">
                  <span className="work-card__name">{p.name}</span>
                  <span className="work-card__meta">⭐ {p.stars} · {p.license}</span>
                </div>
                <p className="work-card__desc">{p.desc}</p>
                <div className="work-card__tags">
                  {p.tags.map(t => (
                    <span key={t} className="work-card__tag">{t}</span>
                  ))}
                </div>
                <div className="work-card__actions">
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--ghost">
                    GitHub
                  </a>
                  <a href={p.demo} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--ghost">
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
