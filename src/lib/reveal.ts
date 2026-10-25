import { isReducedMotion } from './motion'

/**
 * 滚动入场 —— IntersectionObserver 版。
 *
 * 这里原来用 GSAP + ScrollTrigger：14 个组件各自 `gsap.set(..., { opacity: 0 })`
 * 配 `ScrollTrigger.batch(...)` 再 `gsap.to(...)`。它的语义其实只有一句 ——
 * 「元素进入视口时，从位移 + 透明过渡到原位 + 不透明」，而这件事
 * IntersectionObserver + CSS transition 原生就有。
 *
 * 换掉它省下的不只是体积：gsap 是静态 import，挂在 index.tsx → microInteractions.ts
 * 这条首屏链上，114KB（gzip 45KB）每次打开都要下载、解析、执行。改用 IO 之后，
 * 这段动画不再占首屏关键路径。
 *
 * 视觉等价性由 globals.css 的 `.reveal` 承担：位移量、时长、批量 stagger、
 * expo 缓动都按各组件原来的数值保留。reduced-motion 下不挂类，元素保持可见。
 *
 * 注意入场位移走的是 CSS 独立属性 `translate`（不是 `transform`），这样
 * `.work-card.glass-float:hover` / `.glass-float:active` 这类基于 `transform` 的
 * 规则不会被 `.reveal.is-in` 的 `transform: none` 压掉 —— 两者是相乘关系。
 */

export type RevealOptions = {
  /** 垂直位移初值（px），默认 40；Timeline 从左侧进入时用 x */
  offset?: number
  /** 水平位移初值（px），与 offset 互斥 */
  x?: number
  /** 过渡时长（ms），默认 450 */
  duration?: number
  /** 同批元素之间的 stagger（ms），默认 80 */
  stagger?: number
  /** 整体延迟（ms），默认 0 —— 用于同一屏里错开两组元素的入场 */
  delay?: number
  /** 触发线：元素进入视口高度该百分比时播放，默认 85 */
  start?: number
}

export function revealOnScroll(
  root: ParentNode | null | undefined,
  selector: string,
  options: RevealOptions = {},
): () => void {
  const { offset = 40, x, duration = 450, stagger = 80, start = 85 } = options
  const noop = () => {}

  if (!root) return noop
  if (isReducedMotion()) return noop

  const items = collect(root, selector)
  if (!items.length) return noop

  // 老浏览器没有 IntersectionObserver：宁可没有动效，也不能把内容留在 opacity:0。
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => {
      el.style.opacity = '1'
      el.style.translate = '0 0'
    })
    return noop
  }

  items.forEach((el, i) => {
    el.classList.add('reveal')
    el.style.setProperty(
      '--reveal-translate',
      x !== undefined ? `${x}px 0` : `0 ${offset}px`,
    )
    el.style.setProperty('--reveal-dur', `${duration}ms`)
    // 延迟按元素在列表中的序号给：同一批进入视口的元素序号连续，
    // 相互之间的间隔与 GSAP 的 `stagger` 完全一致。
    el.style.setProperty('--reveal-delay', `${i * stagger}ms`)
  })

  const triggerLine = (window.innerHeight * start) / 100
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }
    },
    // bottom 负边距把 root 的可交区域压到视口高度的 start%，
    // 等价于 ScrollTrigger 的 `start: 'top 85%'`。
    { rootMargin: `0px 0px ${-(100 - start)}% 0px`, threshold: 0 },
  )

  items.forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.top < triggerLine && rect.bottom > 0) {
      // 已经在视口里的立刻到位，不等 IO 回调 —— 否则筛选切换时元素会先闪回
      // opacity:0 再播一次入场。
      el.classList.add('is-in')
      return
    }
    io.observe(el)
  })

  return () => {
    io.disconnect()
    items.forEach((el) => {
      el.classList.remove('reveal', 'is-in')
      el.style.removeProperty('--reveal-translate')
      el.style.removeProperty('--reveal-dur')
      el.style.removeProperty('--reveal-delay')
    })
  }
}

/** 取目标元素：容器的后代 + 容器自身（Hero 直接对 panel 调用时用得到）。 */
function collect(root: ParentNode, selector: string): HTMLElement[] {
  const out = Array.from(root.querySelectorAll<HTMLElement>(selector))
  if (root instanceof HTMLElement && root.matches(selector)) out.unshift(root)
  return out
}
