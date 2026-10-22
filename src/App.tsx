import { lazy, Suspense, useEffect } from 'react'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import { setupMicroInteractions } from './microInteractions'
import LoadingScreen from './components/ui/LoadingScreen'

const Services = lazy(() => import('./components/sections/Services'))
const Works = lazy(() => import('./components/sections/Works'))
const Stack = lazy(() => import('./components/sections/Stack'))
const Process = lazy(() => import('./components/sections/Process'))
const Testimonials = lazy(() => import('./components/sections/Testimonials'))
const Contact = lazy(() => import('./components/sections/Contact'))

function SectionSkeleton() {
  return (
    <div style={{ padding: 'var(--sp-7) 0', minHeight: '200px', background: 'var(--c-panel)', borderRadius: 'var(--r-lg)' }} />
  )
}

export default function App() {
  useEffect(() => {
    setupMicroInteractions()
    // Scroll progress
    const progressBar = document.getElementById('scroll-progress')
    const onScroll = () => {
      if (!progressBar) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      progressBar.style.width = progress + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    // Apply hyalite
    if (typeof (window as any).Hyalite !== 'undefined') {
      const Hyalite = (window as any).Hyalite
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const panelSelector = mobile
        ? '.glass-nav, .glass-hero'
        : '.glass-nav, .glass-hero, .glass-contact, .glass-modal'
      Hyalite.watch(document.body, panelSelector, {
        bevel: 37, thickness: 59, shape: 'lip', slope: 2.7, blur: 1,
        dispersion: 1.6, shade: 0.46, rim: 1.76, edgeW: 2.5, sat: 1.4,
        edge: 0.08, light: 1.35, materialize: 600, settle: 200,
      })
      if (!mobile) {
        Hyalite.watch(document.body, '.glass-btn', {
          bevel: 14, thickness: 24, shape: 'squircle', slope: 1.5, blur: 1,
          dispersion: 1.4, shade: 0.40, rim: 1.5, edgeW: 1.5, sat: 1.3,
          edge: 0.08, light: 1.35, materialize: 600, settle: 150,
        })
      }
    }
    return () => {}
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
      <div className="refract-blob" aria-hidden="true" />
      <div className="refract-blob refract-blob--2" aria-hidden="true" />
      <div className="refract-blob refract-blob--3" aria-hidden="true" />
      <div className="light-sweep" aria-hidden="true" />
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
        boxShadow: '0 0 8px var(--c-accent)',
      }} />
      <Navigation />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <Hero />
        <Suspense fallback={<SectionSkeleton />}>
          <Services />
          <Works />
          <Process />
          <Testimonials />
          <Stack />
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
