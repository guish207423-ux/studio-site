import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const articles = [
  {
    title: '液态玻璃的 CSS 实现：从 SVG 滤镜到 Apple 设计语言',
    date: '2026-10-15',
    category: '技术',
    readTime: '8 分钟',
    excerpt: '探索如何用 SVG feDisplacementMap 实现真实折射效果，以及苹果 Liquid Glass 设计语言的核心原则。',
    tags: ['CSS', 'SVG', 'Design'],
  },
  {
    title: 'GSAP ScrollTrigger 性能优化：避免滚动卡顿的 5 个技巧',
    date: '2026-10-12',
    category: '性能',
    readTime: '6 分钟',
    excerpt: '从 Lenis 平滑滚动到 content-visibility，系统性优化长页面的滚动性能。',
    tags: ['GSAP', 'Performance', 'ScrollTrigger'],
  },
  {
    title: '开源选品策略：如何选择有商业价值的终端产品',
    date: '2026-10-08',
    category: '策略',
    readTime: '10 分钟',
    excerpt: '从开发者工具到终端产品，选品策略的转变如何影响作品展示的质量与商业价值。',
    tags: ['Open Source', 'Product', 'Strategy'],
  },
  {
    title: 'React 19 + Vite：现代前端架构的最佳实践',
    date: '2026-10-03',
    category: '架构',
    readTime: '12 分钟',
    excerpt: 'React 19 新特性、Vite 构建优化、代码分割策略，以及如何构建高性能 SPA。',
    tags: ['React', 'Vite', 'Architecture'],
  },
]

export default function Blog() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cards = gridRef.current.querySelectorAll('.blog-card')
    const ctx = gsap.context(() => {
      gsap.set(cards, { y: 30, opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'expo.out' })
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section zone" id="blog" aria-labelledby="blog-title">
      <div className="container">
        <header className="section-head">
          <h2 id="blog-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 洞察与文章</h2>
          <p className="section-head__sub">技术分享 · 设计思考 · 行业洞察</p>
        </header>

        <div ref={gridRef} className="blog-grid">
          {articles.map((a) => (
            <article key={a.title} className="blog-card glass-float">
              <div className="blog-card__meta">
                <span className="blog-card__category">{a.category}</span>
                <span className="blog-card__date">{a.date}</span>
                <span className="blog-card__read">{a.readTime}</span>
              </div>
              <h3 className="blog-card__title">{a.title}</h3>
              <p className="blog-card__excerpt">{a.excerpt}</p>
              <div className="blog-card__tags">
                {a.tags.map(t => (
                  <span key={t} className="blog-card__tag">{t}</span>
                ))}
              </div>
              <a href="#" className="blog-card__link">阅读全文 →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
