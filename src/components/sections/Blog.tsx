import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'

gsap.registerPlugin(ScrollTrigger)

// 都是做这个站（和开源调研）时真实记下的东西，不是设想中的选题。
// 还没写成完整文章，所以不标阅读时长、不放全文链接。
const notes = [
  {
    title: '液态玻璃在网页里到底怎么做',
    date: '2026-10-15',
    category: '技术',
    excerpt: '用 SVG feDisplacementMap 做位移折射，backdrop-filter 做兜底。滤镜值调过头会糊成一片，得靠 A/B 对比才看得出差别。',
    tags: ['CSS', 'SVG'],
  },
  {
    title: '主卡在手机上把标题挤断行的原因',
    date: '2026-10-21',
    category: '前端',
    excerpt: '卡片内边距写死 104px，390px 的屏上只剩 150px 内容区，三个字的标题被迫拆两行。收到 24px 就正常了。',
    tags: ['Responsive', 'Layout'],
  },
  {
    title: '滚动进场动画会把内容留在看不见的状态',
    date: '2026-10-22',
    category: '动效',
    excerpt: '标签页被节流时 GSAP 的 opacity 补间会停住，卡片永久停在 0。加一个超时兜底，视口内卡住的强制显形。',
    tags: ['GSAP', 'Motion'],
  },
  {
    title: '把上百个开源项目筛到十几个的方法',
    date: '2026-10-18',
    category: '调研',
    excerpt: '先看 LICENSE 原文能不能商用，再看最近一次提交，最后才看星数。星数只当热度信号，不当质量证据。',
    tags: ['Open Source'],
  },
  {
    title: '深色底上的灰字，看着够其实不达标',
    date: '2026-10-24',
    category: '无障碍',
    excerpt: '#7A7A7A 压在 #141414 上，对比度只有 4.29，离 AA 要的 4.5 差一点。提到 #828282 才过线。',
    tags: ['A11y', 'Color'],
  },
  {
    title: '静态站部署踩过的三个坑',
    date: '2026-10-22',
    category: '部署',
    excerpt: '子路径资源要改成相对路径；主域用 CNAME 会把 MX 顶掉，收信就没了；没有证书时浏览器直接拒绝 HTTP。',
    tags: ['Deploy', 'DNS'],
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
          <SectionIcon name="blog" />
          <h2 id="blog-title" className="section-head__title">工作笔记</h2>
          <p className="section-head__sub">做项目时随手记的几段，还没整理成文章</p>
        </header>

        <div ref={gridRef} className="blog-grid">
          {notes.map((a) => (
            <article key={a.title} className="blog-card glass-float">
              <div className="blog-card__meta">
                <span className="blog-card__category">{a.category}</span>
                <span className="blog-card__date">{a.date}</span>
              </div>
              <h3 className="blog-card__title">{a.title}</h3>
              <p className="blog-card__excerpt">{a.excerpt}</p>
              <div className="blog-card__tags">
                {a.tags.map(t => (
                  <span key={t} className="blog-card__tag">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
