import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 字体必须排在 globals.css 之前：globals.css 里的 @font-face 已全部迁到 fonts.css，
// 这里的顺序决定浏览器拿到字体声明与样式表的先后。
import './styles/fonts.css'
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

    // 幂等守卫：已经全部接好就直接返回。
    // 背景：Hyalite 的 stop() 只停 watcher，不回收它注入的 <filter> 与元素上的
    // --hyalite；而 detach() 会把滤镜 DOM 删掉、却让元素保留指向已删 id 的
    // --hyalite（下次 watch 又因为内部记录仍认为"挂过了"而跳过）——
    // 结果是主题切换后玻璃凭空消失。既然本站只有一套深色主题，正确解法是
    // **不重建**：接好了就别动，需要换主题时再单独设计重挂流程。
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('.glass-contact, .glass-nav'),
    )
    if (targets.length > 0 && targets.every((el) => el.style.getPropertyValue('--hyalite'))) return

    stopWatchers.forEach((stop) => stop())
    stopWatchers.length = 0

    const mobile = window.matchMedia('(max-width: 767px)').matches
    // .hero-panel 与 .glass-* 同属「面板」档（thickness/bevel 大、shape:lip），
    // 但它在 <767px 下短边会被 bevel clamp 削掉大半，所以移动端只挂 nav。
    const panelSelector = mobile
      ? '.glass-nav'
      : '.glass-nav, .glass-contact'
    // 注意这个 push 的写法：必须是「现在就 watch，把 stop 存起来」。
    // 原先写的是 stopWatchers.push(() => Hyalite.watch(...).stop()) ——
    // 存进去的是一个「先开启再立刻关闭」的函数，于是这一整段从来没启动过 watcher，
    // 玻璃永远停在 CSS 兜底档（filters=0 也不报错，正是最难查的那种静默失效）。
    const panelHandle = window.Hyalite.watch(document.body, panelSelector, hyaliteParams('panel'))
    stopWatchers.push(() => panelHandle.stop())
  } catch(e) {
    console.error('applyHyalite error:', e.message, e.stack);
  }
}

// Apply hyalite —— 不在本文件顶层调用：此时 App 尚未渲染，.glass-* 元素还不存在，
// watcher 会拿到空集合。由 App 挂载后的 'app:booted' 事件驱动（见下方）。
// 早于渲染的那次调用只作兜底（例如 App 的 effect 因异常没跑）。


window.addEventListener('themechange', applyHyalite);

// index.html 里手写了一份静态首屏壳（导航 + Hero）。React 一挂载就会把它整体替换，
// 所以要先记住「壳已经画过」：Hero 拿到这个标记就跳过入场补间，
// 否则用户会看到同一段标题先出现、再消失、再淡入 —— 比没有壳更糟。
const rootEl = document.getElementById('root')!;
;(window as any).__HAS_STATIC_SHELL__ = rootEl.childElementCount > 0

createRoot(rootEl).render(
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

// 懒加载的 section（Services / Pricing / Contact…）在 'app:booted' 之后才挂载，
// 那一次接线看到的是空集合 —— 玻璃会永远停在 CSS 兜底档（折射等于没接）。
// 用一个短命 MutationObserver 盯着新节点；**只在真有元素还没接上时才重建**，
// 因为重建 = 拆旧滤镜 + 建新滤镜，无条件重跑会把 filter 数量堆成个位数以外的垃圾。
const needsGlass = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>('.glass-contact, .glass-nav'),
  ).some((el) => !el.style.getPropertyValue('--hyalite'))

let reapplyTimer: number | null = null
const glassObserver = new MutationObserver(() => {
  if (reapplyTimer) window.clearTimeout(reapplyTimer)
  reapplyTimer = window.setTimeout(() => {
    if (!needsGlass()) { glassObserver.disconnect(); return }
    applyHyalite()
    if (!needsGlass()) glassObserver.disconnect()
  }, 250)
})
glassObserver.observe(document.body, { childList: true, subtree: true })
window.setTimeout(() => glassObserver.disconnect(), 8000)

// hyalite.js 是 defer 脚本，排在 module 之后执行 —— 上面这些调用跑的时候
// window.Hyalite 还不存在，applyHyalite 会静默 return。DOMContentLoaded 是
// defer 脚本全部执行完之后的第一时机，这里再补一次才是真正会生效的那一次。
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => applyHyalite(), { once: true })
} else {
  applyHyalite()
}

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
