import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { initTheme } from './styles/theme'
import { currentTheme, hyaliteLightForTheme } from './lib/hyalite'
initTheme()
import App from './App'
// Lenis smooth scroll integration
import Lenis from 'lenis'

import { isReducedMotion } from './lib/motion'

const reduced = isReducedMotion()

if (!reduced) {
  const lenis = new Lenis({
    lerp: 0.12,
    wheelMultiplier: 1.2,
    touchMultiplier: 1.5,
    smoothWheel: true,
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
//
// 参数档位（v6 增强，数值取自 hyalite 源码 DEFAULTS 与 SKILL 参数表核实值）：
//   bevel 37→46 / thickness 59→84 / slope 2.7→3.4（>1 = 折叠场，rim 内出现液态漩涡）
//   dispersion 1.6→2.4（色散通道分离加大）/ shade 0.46→0.62（边缘变暗 = 透射损失）
//   rim 1.76→2.4（边缘回光）/ edgeW 2.5→4 / sat 1.4→1.9
//   edge 0.08 保持：均匀白描边是「塑料白圈」来源，边缘交给 shape:lip 的隆起截面
// 全部玻璃共用这一张表（原为 nav/contact/modal/btn 四张近似表，数值互相矛盾，
// 且 App.tsx 里的第二份 watch 与本文件重复接线 —— 已删除，见 App.tsx 注释）。
function hyaliteParams(kind: 'panel' | 'button') {
  const light = hyaliteLightForTheme(currentTheme(), kind)
  if (kind === 'button') {
    return {
      bevel: 20, thickness: 38, shape: 'squircle', slope: 2.2, blur: 1,
      dispersion: 2.0, shade: 0.52, rim: 2.1, edgeW: 2.5, sat: 1.7,
      edge: 0.08, light, materialize: 600, settle: 150,
    }
  }
  return {
    bevel: 46, thickness: 84, shape: 'lip', slope: 3.4, blur: 1,
    dispersion: 2.4, shade: 0.62, rim: 2.4, edgeW: 4, sat: 1.9,
    edge: 0.08, light, materialize: 600, settle: 200,
  }
}

const stopWatchers: Array<() => void> = []
;(window as any).applyHyalite = applyHyalite;

function applyHyalite() {
  try {
    if (typeof window.Hyalite === 'undefined') return
    stopWatchers.forEach((stop) => stop())
    stopWatchers.length = 0
    const mobile = window.matchMedia('(max-width: 767px)').matches
    // .hero-panel 与 .glass-* 同属「面板」档（thickness/bevel 大、shape:lip），
    // 但它在 <767px 下短边会被 bevel clamp 削掉大半，所以移动端只挂 nav。
    const panelSelector = mobile
      ? '.glass-nav'
      : '.glass-nav, .glass-contact, .glass-modal, .hero-panel'
    stopWatchers.push(() => window.Hyalite.watch(document.body, panelSelector, hyaliteParams('panel')).stop())
    if (!mobile) {
      stopWatchers.push(() => window.Hyalite.watch(document.body, '.glass-btn', hyaliteParams('button')).stop())
    }
  } catch(e) {
    console.error('applyHyalite error:', e.message, e.stack);
  }
}

// Apply hyalite —— 不在本文件顶层调用：此时 App 尚未渲染，.glass-* 元素还不存在，
// watcher 会拿到空集合。由 App 挂载后的 'app:booted' 事件驱动（见下方）。
// 早于渲染的那次调用只作兜底（例如 App 的 effect 因异常没跑）。


window.addEventListener('themechange', applyHyalite);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
;(window as any).applyHyalite = applyHyalite;

// ---- 玻璃接线启动 ----
// main.tsx 在这里执行时 App 尚未渲染，.glass-nav / .glass-btn 都不存在，
// 现在直接 watch 会得到空集合（玻璃静默失效）。所以由 App 挂载后发 boot 事件驱动。
window.addEventListener('app:booted', () => { applyHyalite() }, { once: true })
applyHyalite()

// 曾经注册过 sw.js（cache-first，且缓存名从不更新）：
// 它会让回访用户永远看到第一次加载的 HTML，新版本发布后也刷不出来。
// 这里改成主动注销 + 清缓存，把这个坑从老用户浏览器里拔掉。
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then(() => (window.caches ? caches.keys() : Promise.resolve([])))
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('studio-site')).map((k) => caches.delete(k))))
      .catch(() => {})
  })
}
