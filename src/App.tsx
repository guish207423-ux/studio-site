import { lazy, Suspense, useEffect } from 'react'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import { setupMicroInteractions } from './microInteractions'
import LoadingScreen from './components/ui/LoadingScreen'
import DynamicLight from './components/ui/DynamicLight'
import FloatingChat from './components/ui/FloatingChat'
import ScrollToTop from './components/ui/ScrollToTop'
import CookieConsent from './components/ui/CookieConsent'

const Services = lazy(() => import('./components/sections/Services'))
const Works = lazy(() => import('./components/sections/Works'))
const Process = lazy(() => import('./components/sections/Process'))
const Testimonials = lazy(() => import('./components/sections/Testimonials'))
const About = lazy(() => import('./components/sections/About'))
const Partners = lazy(() => import('./components/sections/Partners'))
const CaseStudies = lazy(() => import('./components/sections/CaseStudies'))
const Pricing = lazy(() => import('./components/sections/Pricing'))
const Blog = lazy(() => import('./components/sections/Blog'))
const Contact = lazy(() => import('./components/sections/Contact'))

function SectionSkeleton() {
  return (
    <div style={{ padding: 'var(--sp-7) 0', minHeight: '200px', background: 'var(--c-panel)', borderRadius: 'var(--r-lg)' }} />
  )
}

export default function App() {
  useEffect(() => {
    // 玻璃接线在挂载后才有效：main.tsx 执行时 DOM 里还没有 .glass-* 元素。
    // 这里等一帧让子组件（导航 / 按钮）完成首次渲染，再触发 watch。
    const boot = requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('app:booted'))
    })
    setupMicroInteractions()
    // Pause heavy animations during scroll for better performance
    let scrollTimer: ReturnType<typeof setTimeout> | null = null
    const onScrollPause = () => {
      document.body.classList.add('is-scrolling')
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling')
      }, 150)
    }
    window.addEventListener('scroll', onScrollPause, { passive: true })

    // Scroll progress (throttled via rAF)
    const progressBar = document.getElementById('scroll-progress')
    let ticking = false
    const onScroll = () => {
      if (ticking || !progressBar) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        progressBar.style.width = progress + '%'
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    // Apply hyalite —— 已移至 src/main.tsx 的 applyHyalite()（全站唯一接线点）。
    // 原先这里还有第二份 Hyalite.watch：与 main.tsx 的 watcher 盯同一批选择器、
    // 数值却不同（bevel 24/37、slope 2.0/2.7、light 1.35 vs 主题值），后注册者
    // 静默覆盖前者，导致「参数改了没生效」的假象。删掉重复接线后，参数档位只有
    // main.tsx:hyaliteParams 一处真源。
    // 兜底：入场动画（GSAP）万一卡住（标签页失焦/浏览器节流），不能把内容永久留在 opacity:0。
    // 只处理「已在视口内且卡住超过 1.2s」的元素，不影响正常的滚动入场。
    const stuckSeen = new WeakMap<Element, number>()
    const revealWatchdog = () => {
      const now = performance.now()
      const vh = window.innerHeight
      const sel = '.team-card, .testimonial-card, .case-card, .partner-item, .service-card, .pricing-card, .timeline-item, .blog-card, .stack-tag, .work-card'
      document.querySelectorAll<HTMLElement>(sel).forEach(el => {
        const rect = el.getBoundingClientRect()
        // 已经划过屏幕上沿的元素：直接补齐，避免快速滚动时永久停在 opacity:0
        if (rect.bottom <= 0) {
          if (parseFloat(getComputedStyle(el).opacity) < 0.98) {
            el.style.opacity = '1'
            el.style.transform = 'none'
          }
          stuckSeen.delete(el)
          return
        }
        const inView = rect.top < vh - 40
        if (!inView) { stuckSeen.delete(el); return }
        const op = parseFloat(getComputedStyle(el).opacity)
        if (op >= 0.98) { stuckSeen.delete(el); return }
        const first = stuckSeen.get(el)
        if (first === undefined) { stuckSeen.set(el, now); return }
        if (now - first > 1200) {
          el.style.opacity = '1'
          el.style.transform = 'none'
          stuckSeen.delete(el)
        }
      })
    }
    const watchdogTimer = window.setInterval(revealWatchdog, 400)

    return () => {
      cancelAnimationFrame(boot)
      window.removeEventListener('scroll', onScrollPause)
      window.removeEventListener('scroll', onScroll)
      window.clearInterval(watchdogTimer)
      if (scrollTimer) clearTimeout(scrollTimer)
    }
  }, [])

  return (
    <>
      <a href="#main" className="skip-link" style={{
        position: 'fixed',
        top: '-100%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'var(--c-accent)',
        color: 'var(--c-accent-ink)',
        padding: '8px 20px',
        borderRadius: '0 0 var(--r-md) var(--r-md)',
        fontSize: '14px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'top 0.2s ease',
      }}
      onFocus={e => { e.currentTarget.style.top = '0' }}
      onBlur={e => { e.currentTarget.style.top = '-100%' }}
      >跳转到主要内容</a>
      <LoadingScreen />
      <DynamicLight />
      {/* Scroll progress bar */}
      <div id="scroll-progress" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '2px',
        background: 'var(--c-accent)',
        zIndex: 200,
        width: '0%',
        transition: 'width 0.1s linear',
        /* 细光，不用霓虹外发光 */
        boxShadow: '0 0 0 0.5px rgba(212, 255, 63, 0.35)',
      }} />
      <Navigation />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <Hero />
        <Suspense fallback={<SectionSkeleton />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Services />
          <Works />
          <Process />
          <Testimonials />
          <Partners />
          <CaseStudies />
          <Pricing />
          <Blog />
          <Contact />
        </Suspense>
      </main>
      <Footer />

      {/* Floating chat widget */}
      <FloatingChat />
      <ScrollToTop />
      <CookieConsent />
      {/* 悬浮联系方式由 FloatingChat 组件统一提供，此处不再重复放置 */}
    </>
  )
}
