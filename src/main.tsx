import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
// Lenis smooth scroll integration
import Lenis from 'lenis'

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reduced) {
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  })

  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Expose for anchor navigation fallback
  ;(window as any).lenis = lenis
}

// Hyalite liquid glass integration
declare global {
  interface Window {
    Hyalite: {
      watch: (root: HTMLElement, selector: string, params: Record<string, unknown>) => { stop: () => void }
    }
  }
}

function applyHyalite() {
  if (typeof window.Hyalite === 'undefined') return

  const mobile = window.matchMedia('(max-width: 767px)').matches
  const panelParams = {
    bevel: 37, thickness: 59, shape: 'lip', slope: 2.7, blur: 1,
    dispersion: 1.6, shade: 0.46, rim: 1.76, edgeW: 2.5, sat: 1.4,
    edge: 0.08, light: -140, materialize: 600, settle: 200,
  }
  const buttonParams = {
    bevel: 14, thickness: 24, shape: 'squircle', slope: 1.5, blur: 1,
    dispersion: 1.4, shade: 0.40, rim: 1.5, edgeW: 1.5, sat: 1.3,
    edge: 0.08, light: -140, materialize: 600, settle: 150,
  }

  const panelSelector = mobile
    ? '.glass-nav, .glass-hero'
    : '.glass-nav, .glass-hero, .glass-contact, .glass-modal'

  window.Hyalite.watch(document.body, panelSelector, panelParams)

  if (!mobile) {
    window.Hyalite.watch(document.body, '.glass-btn', buttonParams)
  }
}

// Wait for hyalite.js to load
if (document.readyState === 'complete') {
  applyHyalite()
} else {
  window.addEventListener('load', applyHyalite)
}

// Micro-interactions are set up in App.tsx useEffect (after React mounts)
// to ensure #root has children before querySelectorAll runs

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
