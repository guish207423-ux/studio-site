import { useEffect, useRef, useState } from 'react'

export function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 「能否用 hover 做交互」的统一判定（C2）。
 *
 * 触屏没有 hover，prefers-reduced-motion 下也不该注册「非用户主动触发的动效」。
 * 各组件不再各自 matchMedia —— Works 的悬停播放曾经自己判一次，
 * 判完就定死：用户切回 hover 设备或关掉减弱动效时不会重新注册。
 */
export function canHover(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches &&
    !isReducedMotion()
  )
}

/**
 * canHover 的反应式版本（C2）。
 *
 * 与 useReducedMotion 同构：挂载时读一次不够，用户在系统里切换「减弱动态效果」
 * 或外接显示器（hover 能力变化）时，已经注册的事件监听不会自己失效。
 * 订阅 MediaQueryList，变化时刷新 state，让订阅组件重新接线。
 */
export function useCanHover(): boolean {
  const [hoverable, setHoverable] = useState(canHover)

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover)')
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setHoverable(canHover())
    hoverQuery.addEventListener('change', sync)
    reduceQuery.addEventListener('change', sync)
    return () => {
      hoverQuery.removeEventListener('change', sync)
      reduceQuery.removeEventListener('change', sync)
    }
  }, [])

  return hoverable
}

/**
 * 统一的 reduced-motion 判定（C7）。
 *
 * 每个组件不再各自 matchMedia：挂载时读一次不够 —— 用户在系统设置里改
 * 「减弱动态效果」时，已挂载的 GSAP 动画不会停。这里订阅 MediaQueryList，
 * 变化时同步刷新 ref，并在回调里做两件事：
 *   1. 让已注册的入场动画立即落到终态（opacity:1 / 无位移），不留 opacity:0；
 *   2. 让订阅者在 change 里自己回滚（调用方传入 onReducedChange）。
 */
export function useReducedMotion(
  onReducedChange?: (reduced: boolean) => void,
): boolean {
  const [reduced, setReduced] = useState(isReducedMotion)
  const handlerRef = useRef(onReducedChange)
  handlerRef.current = onReducedChange

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches)
      settleRevealedElements()
      handlerRef.current?.(e.matches)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * reduced-motion 打开时，把所有还停在「入场前」状态的卡片直接补齐。
 * 覆盖选择器与各组件 gsap.set(..., { opacity: 0 }) 的入场集合一致。
 */
function settleRevealedElements() {
  const selector = [
    '.principle-item', '.case-card',
    '.service-card', '.pricing-card', '.timeline-item',
    '.stack-tag', '.work-card', '.process-step', '.hero-panel',
  ].join(',')
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.opacity = '1'
    el.style.transform = 'none'
  })
}

export function rafThrottle<T extends (...a: any[]) => void>(fn: T): T {
  let pending = false
  const wrapped = (...args: any[]) => {
    if (pending) return
    pending = true
    requestAnimationFrame(() => { pending = false; fn(...args) })
  }
  return wrapped as T
}
