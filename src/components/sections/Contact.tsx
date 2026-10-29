import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

/** C3：校验失败的抖动时长（ms）。5 次 3px 往复，reduced-motion 下为 0（跳过）。 */
const SHAKE_MS = 300

export default function Contact() {
  const formRef = useRef<HTMLDivElement>(null)
  const sideRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '', budget: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!formRef.current || !sideRef.current || reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.4, ease: 'expo.out',
        scrollTrigger: { trigger: formRef.current, start: 'top 85%', once: true },
      })
      gsap.fromTo(sideRef.current, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.4, ease: 'expo.out', delay: 0.1,
        scrollTrigger: { trigger: sideRef.current, start: 'top 85%', once: true },
      })
    })
    return () => ctx.revert()
  }, [reduced])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '请填写姓名'
    if (!formData.email.trim()) newErrors.email = '请填写邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = '邮箱格式不正确'
    if (!formData.message.trim()) newErrors.message = '请填写留言内容'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      if (!reduced && formRef.current) {
        const card = formRef.current
        card.classList.remove('is-shaking')
        void card.offsetWidth
        card.classList.add('is-shaking')
        window.setTimeout(() => card.classList.remove('is-shaking'), SHAKE_MS)
      }
      return
    }
    {
      const body = [
        `姓名：${formData.name}`,
        `邮箱：${formData.email}`,
        formData.budget ? `预算：${formData.budget}` : '',
        '',
        formData.message,
      ].filter(Boolean).join('\n')
      const subject = formData.budget ? `项目咨询 · ${formData.budget}` : '项目咨询'
      window.location.href = `mailto:3629748383@qq.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setSubmitted(true)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', budget: '', message: '' })
    setErrors({})
    setSubmitted(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  if (submitted) {
    return (
      <section className="section section--ink2 zone" id="contact" aria-labelledby="contact-title">
        <div className="container">
          <header className="section-head">
            <h2 id="contact-title" className="section-head__title">联系方式</h2>
            <p className="section-head__sub"><SectionIcon name="contact" size={16} /> 联系我们</p>
          </header>
          <div className="glass glass-contact">
            <div className="contact-success">
              <div className="contact-success__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="contact-success__title">提交成功</h3>
              <p className="contact-success__text">收到了，我们会在一天内回复你。</p>
              <button onClick={handleReset} className="btn btn--md btn--secondary">
                再次填写
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section section--ink2 zone" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <header className="section-head">
          <h2 id="contact-title" className="section-head__title">联系方式</h2>
          <p className="section-head__sub"><SectionIcon name="contact" size={16} /> 联系我们</p>
        </header>

        <div className="contact-grid">
          {/* Form */}
          <div ref={formRef} className="glass glass-contact">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">姓名</label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="你的姓名"
                  className={`form-input${errors.name ? ' is-error' : ''}`}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">邮箱</label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="你的邮箱"
                  className={`form-input${errors.email ? ' is-error' : ''}`}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="contact-budget" className="form-label">
                  预算范围<span className="form-label__optional">（选填，方便直接给方案）</span>
                </label>
                <select
                  id="contact-budget"
                  value={formData.budget}
                  onChange={e => handleChange('budget', e.target.value)}
                  className="form-select"
                >
                  <option value="">还没定</option>
                  <option value="1 万以内">1 万以内</option>
                  <option value="1–3 万">1–3 万</option>
                  <option value="3–5 万">3–5 万</option>
                  <option value="5 万以上">5 万以上</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message" className="form-label">留言内容</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={formData.message}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder="请描述你的项目需求…"
                  className={`form-textarea${errors.message ? ' is-error' : ''}`}
                />
                {errors.message && <p className="form-error">{errors.message}</p>}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn--md btn--primary glass-btn">
                  <span>提交留言</span>
                </button>
                <button type="button" onClick={handleReset} className="btn btn--md btn--ghost">
                  清空
                </button>
              </div>
            </form>
          </div>

          {/* Side info */}
          <div ref={sideRef} className="contact-side">
            <div className="contact-card">
              <h3 className="contact-card__title">邮箱</h3>
              <a href="mailto:guish207423@gmail.com" className="contact-card__value">guish207423@gmail.com</a>
            </div>

            <div className="contact-card">
              <h3 className="contact-card__title">微信</h3>
              <p className="contact-card__value contact-card__value--secondary">qqwwlfy2423</p>
            </div>

            <div className="contact-card">
              <h3 className="contact-card__title">响应时间</h3>
              <p className="contact-card__value contact-card__text--secondary">
                工作日 24 小时内回复<br />项目咨询请附需求描述
              </p>
            </div>

            <a
              href="mailto:3629748383@qq.com?subject=预约沟通&body=方便的时间段：%0A想聊的内容："
              className="btn btn--lg btn--primary glass-btn btn--full"
            >
              <span className="btn__icon-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M8 3v4M16 3v4M3 11h18" />
                </svg>
                约个时间聊
              </span>
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="section-gap">
          <h3 className="faq-title">常见问题</h3>
          <div className="faq-list">
            {[
              { q: '项目周期一般多长？', a: '根据项目复杂度，通常 4-12 周。简单页面 2-4 周，完整产品 8-12 周。' },
              { q: '是否支持远程协作？', a: '完全支持。我们全程远程协作，通过视频会议、Figma、GitHub 等工具保持高效沟通。' },
              { q: '如何保证项目质量？', a: '每阶段都有验收节点，代码审查、性能测试、无障碍检查，确保交付质量。' },
              { q: '是否提供售后支持？', a: '交付后提供 30 天免费支持，后续可按需签约维护。' },
              { q: '定价是否可议？', a: '基础方案价格固定，企业方案可根据需求定制。长期合作有折扣，具体谈。' },
              { q: '是否支持分期付款？', a: '支持。通常按里程碑分期：启动 30%、中期 40%、交付 30%。' },
              { q: '源码是否交付？', a: '所有项目均交付完整源码与文档，客户拥有全部知识产权。' },
              { q: '是否可以只做设计不开发？', a: '可以。我们支持设计-only、开发-only 或全栈交付，按需组合。' },
            ].map((faq, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">
                  {faq.q}
                  <span className="faq-icon" aria-hidden="true">+</span>
                </summary>
                <p className="faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
