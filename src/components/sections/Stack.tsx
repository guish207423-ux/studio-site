import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stackGroups = [
  {
    title: '前端',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'GSAP', 'Framer Motion', 'Lenis', 'React Router'],
  },
  {
    title: '后端',
    items: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API'],
  },
  {
    title: 'DevOps',
    items: ['Vercel', 'Docker', 'GitHub Actions', 'Nginx', 'Cloudflare'],
  },
  {
    title: '设计',
    items: ['Figma', 'Blender', 'After Effects', 'Photoshop', 'Illustrator'],
  },
  {
    title: '工具',
    items: ['Git', 'VS Code', 'Warp', 'Linear', 'Notion', 'Raycast'],
  },
]

export default function Stack() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const tags = gridRef.current.querySelectorAll('.stack-tag')
    const groupHeads = gridRef.current.querySelectorAll('.stack-group__title')

    const ctx = gsap.context(() => {
      gsap.set(tags, { y: 20, opacity: 0 })
      gsap.set(groupHeads, { y: 20, opacity: 0 })

      ScrollTrigger.batch(tags, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'expo.out' })
        },
      })

      ScrollTrigger.batch(groupHeads, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'expo.out' })
        },
      })

      // Ticker fallback
      const ticker = () => {
        tags.forEach((el) => {
          const rect = el.getBoundingClientRect()
          if (rect.bottom < window.innerHeight) {
            const opacity = parseFloat(getComputedStyle(el).opacity)
            if (opacity < 1) gsap.set(el, { opacity: 1, y: 0 })
          }
        })
        groupHeads.forEach((el) => {
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
    <section className="section zone" id="stack" aria-labelledby="stack-title">
      <div className="container">
        <header className="section-head">
          <h2 id="stack-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 技术栈</h2>
          <p className="section-head__sub">全谱系技术储备与工具链</p>
        </header>

        <div ref={gridRef} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-6)',
        }}>
          {stackGroups.map((group) => (
            <div key={group.title}>
              <h3 className="stack-group__title" style={{
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--c-txt)',
                marginBottom: 'var(--sp-3)',
              }}>{group.title}</h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--sp-2)',
              }}>
                {group.items.map((item) => (
                  <span key={item} className="stack-tag" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    color: 'var(--c-txt-2)',
                    background: 'var(--c-panel)',
                    border: '1px solid var(--c-line)',
                    padding: '8px 16px',
                    borderRadius: 'var(--r-pill)',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = 'var(--c-panel-2)'
                    el.style.borderColor = 'var(--c-accent)'
                    el.style.color = 'var(--c-accent)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = 'var(--c-panel)'
                    el.style.borderColor = 'var(--c-line)'
                    el.style.color = 'var(--c-txt-2)'
                  }}
                  >{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
