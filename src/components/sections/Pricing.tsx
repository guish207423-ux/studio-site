import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: '设计稿转线上',
    price: '¥12,000',
    period: '起',
    desc: '你有 Figma，我们把它做成能点的页面',
    features: [
      'Figma 到 React 实现',
      '响应式与无障碍基线',
      '交互与动效还原',
      '含 2 轮修改',
      '2–3 周交付，源码交付',
    ],
    cta: '聊聊这个',
    highlight: false,
  },
  {
    name: '动效升级',
    price: '¥15,000',
    period: '起',
    desc: '产品已经在线，把关键交互做出手感',
    features: [
      '关键路径动效设计',
      '性能预算与降级方案',
      '含 2 轮修改',
      '2–3 周交付，可只做一个模块',
      '附参数说明，方便你自己改',
    ],
    cta: '聊聊这个',
    highlight: false,
  },
  {
    name: '官网重做',
    price: '¥28,000',
    period: '起',
    desc: '5–7 个页面，从品牌梳理做到前端上线',
    features: [
      '页面结构与视觉设计',
      '前端实现与交互动效',
      '含 3 轮修改',
      '部署上线，基础 SEO',
      '4–6 周交付，源码 + 使用文档',
    ],
    cta: '聊聊这个',
    highlight: true,
  },
]

export default function Pricing() {
  const gridRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!gridRef.current || reduced) return

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
  }, [reduced])

  return (
    <section className="section section--ink2 zone" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <header className="section-head">
          <h2 id="pricing-title" className="section-head__title">价格</h2>
          <p className="section-head__sub"><SectionIcon name="pricing" size={16} /> 价格写清楚，组合灵活，进度随时看</p>
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

        {/* 先把「起」的边界说清，再谈维护；顺序反了会被读成在解释维护价 */}
        <p className="pricing-note">
          「起」= 5 页以内、标准交互。超出按页计，报价前会给一张分项单。不含文案撰写、拍摄与第三方服务费用。
        </p>

        {/* 复购入口：交付之后的事，单独一行，标明不单卖，避免被当成第四个套餐 */}
        <div className="retainer">
          <div>
            <p className="retainer__label">仅限已交付项目</p>
            <p className="retainer__title">长期维护 · ¥3,500 起 / 月</p>
            <p className="retainer__desc">
              缺陷修复、依赖升级、性能与无障碍巡检，每月 4 小时内的小改动。不单独出售。
            </p>
          </div>
          <a href="#contact" className="btn btn--md btn--secondary">问问维护</a>
        </div>

        {/* 同行合作：不面向终端客户的一条现金流，放在最后，不抢主报价 */}
        <p className="pricing-note pricing-note--b2b">
          同行合作：给设计公司、广告公司做前端交付。你们对客户，我们不出面，可以按项目或按月结算。
        </p>
      </div>
    </section>
  )
}
