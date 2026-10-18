import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const formRef = useRef<HTMLDivElement>(null)
  const sideRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!formRef.current || !sideRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

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
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '请填写姓名'
    if (!formData.email.trim()) newErrors.email = '请填写邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = '邮箱格式不正确'
    if (!formData.message.trim()) newErrors.message = '请填写留言内容'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduced && formRef.current) {
        gsap.to(formRef.current, { x: 3, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'x' })
      }
      return
    }
    setSubmitted(true)
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' })
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
            <h2 id="contact-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 联系方式</h2>
            <p className="section-head__sub">开始一个项目</p>
          </header>
          <div className="glass glass-contact" style={{
            maxWidth: 600,
            margin: '0 auto',
            padding: 'var(--sp-7)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--c-ok)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--sp-4)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{
              fontWeight: 700,
              fontSize: '24px',
              color: 'var(--c-txt)',
              marginBottom: 'var(--sp-3)',
            }}>提交成功</h3>
            <p style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--c-txt-2)',
              marginBottom: 'var(--sp-5)',
            }}>感谢您的留言，我们会在 24 小时内回复。</p>
            <button onClick={handleReset} className="btn btn--md btn--secondary">
              再次填写
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section section--ink2 zone" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <header className="section-head">
          <h2 id="contact-title" className="section-head__title"><span className="section-head__prefix">⌁</span> 联系方式</h2>
          <p className="section-head__sub">开始一个项目</p>
        </header>

        <div className="contact-grid">
          {/* Form */}
          <div ref={formRef} className="glass glass-contact" style={{
            padding: 'var(--sp-6)',
          }}>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <label htmlFor="contact-name" style={{
                  display: 'block',
                  fontSize: 'var(--fs-body-sm)',
                  fontWeight: 500,
                  color: 'var(--c-txt-2)',
                  marginBottom: 'var(--sp-2)',
                }}>姓名</label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="你的姓名"
                  style={{
                    width: '100%',
                    height: 48,
                    background: 'var(--c-panel-2)',
                    border: `1px solid ${errors.name ? 'var(--c-err)' : 'var(--c-line-strong)'}`,
                    borderRadius: 'var(--r-md)',
                    padding: '0 var(--sp-3)',
                    color: 'var(--c-txt)',
                    fontSize: 'var(--fs-body)',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--c-accent)'
                    e.currentTarget.style.boxShadow = 'var(--sh-focus)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = errors.name ? 'var(--c-err)' : 'var(--c-line-strong)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                {errors.name && (
                  <p style={{ fontSize: '13px', color: 'var(--c-err)', marginTop: 'var(--sp-1)' }}>{errors.name}</p>
                )}
              </div>

              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <label htmlFor="contact-email" style={{
                  display: 'block',
                  fontSize: 'var(--fs-body-sm)',
                  fontWeight: 500,
                  color: 'var(--c-txt-2)',
                  marginBottom: 'var(--sp-2)',
                }}>邮箱</label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    height: 48,
                    background: 'var(--c-panel-2)',
                    border: `1px solid ${errors.email ? 'var(--c-err)' : 'var(--c-line-strong)'}`,
                    borderRadius: 'var(--r-md)',
                    padding: '0 var(--sp-3)',
                    color: 'var(--c-txt)',
                    fontSize: 'var(--fs-body)',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--c-accent)'
                    e.currentTarget.style.boxShadow = 'var(--sh-focus)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = errors.email ? 'var(--c-err)' : 'var(--c-line-strong)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                {errors.email && (
                  <p style={{ fontSize: '13px', color: 'var(--c-err)', marginTop: 'var(--sp-1)' }}>{errors.email}</p>
                )}
              </div>

              <div style={{ marginBottom: 'var(--sp-5)' }}>
                <label htmlFor="contact-message" style={{
                  display: 'block',
                  fontSize: 'var(--fs-body-sm)',
                  fontWeight: 500,
                  color: 'var(--c-txt-2)',
                  marginBottom: 'var(--sp-2)',
                }}>留言内容</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={formData.message}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder="请描述你的项目需求…"
                  style={{
                    width: '100%',
                    background: 'var(--c-panel-2)',
                    border: `1px solid ${errors.message ? 'var(--c-err)' : 'var(--c-line-strong)'}`,
                    borderRadius: 'var(--r-md)',
                    padding: 'var(--sp-3)',
                    color: 'var(--c-txt)',
                    fontSize: 'var(--fs-body)',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 120,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--c-accent)'
                    e.currentTarget.style.boxShadow = 'var(--sh-focus)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = errors.message ? 'var(--c-err)' : 'var(--c-line-strong)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                {errors.message && (
                  <p style={{ fontSize: '13px', color: 'var(--c-err)', marginTop: 'var(--sp-1)' }}>{errors.message}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
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
          <div ref={sideRef} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-4)',
          }}>
            <div style={{
              background: 'var(--c-panel)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-line)',
              padding: 'var(--sp-5)',
            }}>
              <h3 style={{
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--c-txt)',
                marginBottom: 'var(--sp-3)',
              }}>邮箱</h3>
              <a href="mailto:guish207423@gmail.com" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: 'var(--c-accent)',
                textDecoration: 'none',
              }}>guish207423@gmail.com</a>
            </div>

            <div style={{
              background: 'var(--c-panel)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-line)',
              padding: 'var(--sp-5)',
            }}>
              <h3 style={{
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--c-txt)',
                marginBottom: 'var(--sp-3)',
              }}>微信</h3>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: 'var(--c-txt-2)',
              }}>qqwwlfy2423</p>
            </div>

            <div style={{
              background: 'var(--c-panel)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-line)',
              padding: 'var(--sp-5)',
            }}>
              <h3 style={{
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--c-txt)',
                marginBottom: 'var(--sp-3)',
              }}>响应时间</h3>
              <p style={{
                fontSize: 'var(--fs-body-sm)',
                color: 'var(--c-txt-2)',
                lineHeight: 1.7,
              }}>工作日 24 小时内回复<br />项目咨询请附需求描述</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
