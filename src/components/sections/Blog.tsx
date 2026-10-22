import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const articles = [
  {
    title: '液态玻璃的 CSS 实现：从 SVG 滤镜 to Apple 设计语言',
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
  {
    title: '无障碍设计实践：WCAG AA 合规指南',
    date: '2026-09-28',
    category: '无障碍',
    readTime: '9 分钟',
    excerpt: '键盘导航、屏幕阅读器、色彩对比度，构建人人可用的 Web 体验。',
    tags: ['Accessibility', 'WCAG', 'A11y'],
  },
  {
    title: '动效设计心理学：微交互如何影响用户感知',
    date: '2026-09-22',
    category: '设计',
    readTime: '7 分钟',
    excerpt: '从按钮按压到卡片浮起，微交互如何在潜意识层面塑造品牌印象。',
    tags: ['Motion', 'UX', 'Psychology'],
  },
  {
    title: 'GitHub Pages 部署陷阱与解决方案',
    date: '2026-09-18',
    category: 'DevOps',
    readTime: '5 分钟',
    excerpt: 'TLS 连接失败、资源路径、SPA 路由，GitHub Pages 部署的常见问题与解决。',
    tags: ['GitHub Pages', 'Deploy', 'CI/CD'],
  },
  {
    title: '设计系统从 0 到 1：Token、组件与文档',
    date: '2026-09-12',
    category: '设计',
    readTime: '11 分钟',
    excerpt: '从色彩 token 到组件库，构建可维护、可扩展的设计系统。',
    tags: ['Design System', 'Tokens', 'Components'],
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
