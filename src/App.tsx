import { lazy, Suspense, useEffect } from 'react'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import { setupMicroInteractions } from './microInteractions'
import DynamicLight from './components/ui/DynamicLight'
import FloatingToolbar from './components/ui/FloatingToolbar'
import Marquee from './components/ui/Marquee'

const Services = lazy(() => import('./components/sections/Services'))
const Works = lazy(() => import('./components/sections/Works'))
const Process = lazy(() => import('./components/sections/Process'))
const About = lazy(() => import('./components/sections/About'))
const CaseStudies = lazy(() => import('./components/sections/CaseStudies'))
const Pricing = lazy(() => import('./components/sections/Pricing'))
const Contact = lazy(() => import('./components/sections/Contact'))

function SectionSkeleton() {
  return (
    <div className="section-skeleton" />
  )
}

export default function App() {
  useEffect(() => {
    // 玻璃接线：main.tsx 执行时 .glass-* 元素还不存在，watcher 会拿到空集合。
    // 这里在 effect 里直接派发（effect 在 DOM 变更 commit 之后运行，此时元素已在文档中）。
    // 不能用 requestAnimationFrame 包一层：StrictMode 会双调 effect，第一遍的 cleanup
    // 会把 rAF 取消掉，事件永远不派发 —— 玻璃静默失效（实测 svg filter 数 = 0）。
    window.dispatchEvent(new CustomEvent('app:booted'))
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
      const sel = '.principle-item, .case-card, .service-card, .pricing-card, .process-step, .stack-tag, .work-card'
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
      window.removeEventListener('scroll', onScrollPause)
      window.removeEventListener('scroll', onScroll)
      window.clearInterval(watchdogTimer)
      if (scrollTimer) clearTimeout(scrollTimer)
    }
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">跳转到主要内容</a>
      <DynamicLight />
      {/* Scroll progress bar */}
      <div id="scroll-progress" className="scroll-progress" />
      <Navigation />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <Hero />
        <Marquee text="品牌官网 · 动效界面 · 设计稿落地 · 从设计到代码" />
        <Suspense fallback={<SectionSkeleton />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Services />
          <Works />
          <Process />
          <CaseStudies />
          <Pricing />
          <Contact />
        </Suspense>
      </main>
      <Footer />

      {/* Floating toolbar: contact + back-to-top + cookie consent */}
      <FloatingToolbar />
    </>
  )
}
