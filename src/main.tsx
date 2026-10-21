import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { initTheme } from './styles/theme'
import { currentTheme, hyaliteLightForTheme } from './lib/hyalite'
initTheme()
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

// Hyalite liquid glass integration.
// `light` 参与滤镜缓存键，必须在建 watcher 时按当前主题给出 —— 事后改会拿到旧滤镜。
function hyaliteParams(kind: 'panel' | 'button') {
  const light = hyaliteLightForTheme(currentTheme(), kind)
  if (kind === 'button') {
    return {
      bevel: 14, thickness: 24, shape: 'squircle', slope: 1.5, blur: 1,
      dispersion: 1.4, shade: 0.40, rim: 1.5, edgeW: 1.5, sat: 1.3,
      edge: 0.08, light, materialize: 600, settle: 150,
    }
  }
  return {
    bevel: 37, thickness: 59, shape: 'lip', slope: 2.7, blur: 1,
    dispersion: 1.6, shade: 0.46, rim: 1.76, edgeW: 2.5, sat: 1.4,
    edge: 0.08, light, materialize: 600, settle: 200,
  }
}

const stopWatchers: Array<() => void> = []

function applyHyalite() {
  if (typeof window.Hyalite === 'undefined') return

  // 主题切换会重建 watcher（滤镜缓存键含 light，必须重新建）
  stopWatchers.forEach((stop) => stop())
  stopWatchers.length = 0

  const mobile = window.matchMedia('(max-width: 767px)').matches
  const panelSelector = mobile
    ? '.glass-nav, .glass-hero'
    : '.glass-nav, .glass-hero, .glass-contact, .glass-modal'

  stopWatchers.push(() => window.Hyalite.watch(document.body, panelSelector, hyaliteParams('panel')).stop())

  if (!mobile) {
    stopWatchers.push(() => window.Hyalite.watch(document.body, '.glass-btn', hyaliteParams('button')).stop())
  }
}

if (document.readyState === 'complete') {
  let attempts = 0;
  const tryApply = () => {
    if (typeof window.Hyalite !== 'undefined') { applyHyalite(); }
    else if (attempts < 20) { attempts++; setTimeout(tryApply, 100); }
  };
  tryApply();
} else {
  window.addEventListener('load', () => {
    let attempts = 0;
    const tryApply = () => {
      if (typeof window.Hyalite !== 'undefined') { applyHyalite(); }
      else if (attempts < 20) { attempts++; setTimeout(tryApply, 100); }
    };
    tryApply();
  });
}

window.addEventListener('themechange', applyHyalite)

// Micro-interactions are set up in App.tsx useEffect (after React mounts)
// to ensure #root has children before querySelectorAll runs

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
