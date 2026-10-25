import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion, useCanHover } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

// 这里放的是第三方开源项目，不是我们开发的。视频是我们实际使用时的界面录制。
// 星数会变、也容易过期，所以不写死数字；许可证和仓库地址都是可查的。
const projects = [
  {
    name: 'Blender',
    desc: '开源 3D 创作套件，建模 / 动画 / 渲染全流程',
    tags: ['3D', '建模', '渲染'],
    license: 'GPL',
    category: '3D 创作',
    video: './videos/blender.webm',
    poster: './videos/blender-poster.jpg',
    github: 'https://github.com/blender/blender',
    demo: 'https://www.blender.org',
  },
  {
    name: 'Grafana',
    desc: '开放可视化平台，实时数据监控与仪表盘',
    tags: ['TypeScript', 'React', '可视化'],
    license: 'AGPL',
    category: '数据可视化',
    video: './videos/grafana.webm',
    poster: './videos/grafana-poster.jpg',
    github: 'https://github.com/grafana/grafana',
    demo: 'https://grafana.com',
  },
  {
    name: 'Metabase',
    desc: '开源商业智能工具，把数据库里的数据变成能看懂的图表',
    tags: ['Clojure', 'React', 'BI'],
    license: 'AGPL',
    category: '数据可视化',
    video: './videos/metabase.webm',
    poster: './videos/metabase-poster.jpg',
    github: 'https://github.com/metabase/metabase',
    demo: 'https://www.metabase.com',
  },
  {
    name: 'Audacity',
    desc: '开源音频编辑器，多轨录制与波形处理',
    tags: ['C++', '音频', '多轨'],
    license: 'GPL',
    category: '音频编辑',
    video: './videos/audacity.webm',
    poster: './videos/audacity-poster.jpg',
    github: 'https://github.com/audacity/audacity',
    demo: 'https://www.audacityteam.org',
  },
  {
    name: 'Penpot',
    desc: '开源设计协作工具，矢量原型与交付',
    tags: ['Clojure', 'SVG', '协作'],
    license: 'AGPL',
    category: '设计协作',
    video: './videos/penpot.webm',
    poster: './videos/penpot-poster.jpg',
    github: 'https://github.com/penpot/penpot',
    demo: 'https://penpot.app',
  },
  {
    name: 'OpenShot',
    desc: '开源视频编辑器，多轨时间线剪辑',
    tags: ['Python', 'Qt', '视频'],
    license: 'GPL',
    category: '视频编辑',
    video: './videos/openshot.webm',
    poster: './videos/openshot-poster.jpg',
    github: 'https://github.com/OpenShot/openshot-qt',
    demo: 'https://www.openshot.org',
  },
]

const categories = ['全部', ...Array.from(new Set(projects.map(p => p.category)))]

export default function Works() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [expanded, setExpanded] = useState<string | null>(null)
  const reduced = useReducedMotion()
  // C2：hover 播放的能力判定走统一 hook（含 reduced-motion），不再自己 matchMedia。
  const hoverable = useCanHover()

  const filtered = activeCategory === '全部'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  useEffect(() => {
    const root = gridRef.current
    if (!root) return

    const videos = root.querySelectorAll<HTMLVideoElement>('video[data-hover-play]')
    let activeVideo: HTMLVideoElement | null = null
    const cleanups: Array<() => void> = []

    const playVideo = (v: HTMLVideoElement) => {
      if (activeVideo && activeVideo !== v) {
        activeVideo.pause()
      }
      v.play().catch(() => {})
      activeVideo = v
    }
    const pauseVideo = (v: HTMLVideoElement) => {
      v.pause()
      if (activeVideo === v) activeVideo = null
    }

    videos.forEach(v => {
      v.preload = 'metadata'
      v.muted = true
      v.loop = true
      v.playsInline = true

      const card = v.closest('.work-card')
      if (!card) return

      // C2：hover 播放只在「有 hover 能力且未要求减弱动效」时注册；
      // 触屏与 reduced-motion 都只保留 click 切换（触屏没有 hover，
      // reduced-motion 下自动播放视频属于「非用户主动触发的动效」）。
      // hoverable 变化会重跑本 effect，所以偏好切换时监听会自动重接。
      const onEnter = () => playVideo(v)
      const onLeave = () => pauseVideo(v)
      const onClick = () => { if (v.paused) playVideo(v); else pauseVideo(v) }

      if (hoverable) {
        card.addEventListener('mouseenter', onEnter)
        card.addEventListener('mouseleave', onLeave)
      }
      card.addEventListener('click', onClick)

      // 清理必须用 removeEventListener。原先这里用 card.replaceWith(card.cloneNode(true))
      // 摘监听：克隆节点不在 React 的 DOM 引用里，过滤切换一次之后 React 再渲染时
      // 写入的是已脱离文档的旧节点，界面从此不再更新（分类筛选点了没反应）。
      cleanups.push(() => {
        card.removeEventListener('mouseenter', onEnter)
        card.removeEventListener('mouseleave', onLeave)
        card.removeEventListener('click', onClick)
        pauseVideo(v)
      })
    })

    return () => {
      cleanups.forEach(fn => fn())
      if (activeVideo) {
        activeVideo.pause()
        activeVideo = null
      }
    }
  }, [filtered, hoverable])

  useEffect(() => {
    if (!gridRef.current || reduced) return

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
  }, [filtered, reduced])

  return (
    <section className="section section--ink2 zone" id="works" aria-labelledby="works-title">
      <div className="container">
        <header className="section-head">
          <h2 id="works-title" className="section-head__title">技术资产</h2>
          <p className="section-head__sub"><SectionIcon name="works" size={16} /> 长期跟踪、拆解的开源工程。这些项目覆盖的能力，就是我们能接的范围</p>
        </header>

        {/* Category filter */}
        <div className="works-filter" role="tablist" aria-label="开源项目分类">
          {categories.map(cat => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`works-filter__btn ${activeCategory === cat ? 'works-filter__btn--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div ref={gridRef} className="works-grid perspective-root">
          {filtered.map((p) => (
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
                {/* Hover overlay */}
                <div className="work-card__overlay" aria-hidden="true" />
                <span className="work-card__hint work-card__hint--hover">悬停播放</span>
                <span className="work-card__hint work-card__hint--touch">点按播放</span>
                {/* Category badge */}
                <span className="work-card__category">{p.category}</span>
              </div>

              {/* Content */}
              <div className="work-card__body">
                <div className="work-card__row">
                  <span className="work-card__name">{p.name}</span>
                  <span className="work-card__meta">{p.license} · 第三方开源</span>
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
                    官网
                  </a>
                  <button
                    className="btn btn--sm btn--ghost"
                    onClick={() => setExpanded(expanded === p.name ? null : p.name)}
                    aria-expanded={expanded === p.name}
                  >
                    {expanded === p.name ? '收起' : '详情'}
                  </button>
                </div>

                {/* Expandable detail */}
                {expanded === p.name && (
                  <div className="work-card__detail">
                    <p className="work-card__detail-text">
                      {p.name} 是第三方开源项目，采用 {p.license} 许可证，版权归原作者所有。
                      这里的视频是我们日常使用时录的界面，不是我们开发的产品。
                      放上来是因为它做得够好，值得被更多人知道。
                    </p>
                    <div className="work-card__detail-links">
                      <a href={p.github} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--primary">
                        源码仓库
                      </a>
                      <a href={p.demo} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--secondary">
                        官方站点
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
