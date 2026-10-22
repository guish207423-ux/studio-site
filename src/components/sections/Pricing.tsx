import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: '起步',
    price: '¥8,000',
    period: '起',
    desc: '适合个人项目与小型产品',
    features: ['UI/UX 设计', '响应式前端', '1 轮修改', '2 周交付', '基础 SEO'],
    cta: '开始项目',
    highlight: false,
  },
  {
    name: '专业',
    price: '¥28,000',
    period: '起',
    desc: '适合成长型产品与团队',
    features: ['品牌 VI + 设计系统', '全栈开发', '动效与视频', '3 轮修改', '4-6 周交付', '性能优化', '无障碍审计'],
    cta: '开始项目',
    highlight: true,
  },
  {
    name: '企业',
    price: '定制',
    period: '',
    desc: '适合大型产品与长期合作',
    features: ['全谱系服务', '专属团队', '无限修改', '8-12 周交付', 'SLA 保障', '持续维护', '培训与交接'],
    cta: '联系咨询',
    highlight: false,
  },
]

export default function Pricing() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cards = gridRef.current.querySelectorAll('.pricing-card')
    const ctx = gsap.context(() => {
      gsap.set(cards, { y: 40, opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'expo.out' })
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section section--ink2 zone" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <header className="section-head">
          <h2 id="pricing-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 服务定价</h2>
          <p className="section-head__sub">透明定价 · 灵活组合 · 全程可追</p>
        </header>

        <div ref={gridRef} className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card glass-float ${plan.highlight ? 'pricing-card--highlight' : ''}`}>
              {plan.highlight && <span className="pricing-card__badge">推荐</span>}
              <h3 className="pricing-card__name">{plan.name}</h3>
              <p className="pricing-card__desc">{plan.desc}</p>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">{plan.price}</span>
                {plan.period && <span className="pricing-card__period">{plan.period}</span>}
              </div>
              <ul className="pricing-card__features">
                {plan.features.map(f => (
                  <li key={f} className="pricing-card__feature">
                    <span className="pricing-card__check" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={`btn btn--lg ${plan.highlight ? 'btn--primary' : 'btn--secondary'} glass-btn`} style={{ width: '100%', justifyContent: 'center' }}>
                <span>{plan.cta}</span>
              </a>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--c-txt-3)',
          marginTop: 'var(--sp-5)',
        }}>所有方案均包含源码交付与文档。长期合作可享折扣。</p>
      </div>
    </section>
  )
}
