import { useEffect, useRef } from 'react'

/**
 * 动态光影背景 —— 滚动 / 指针视差 + 低频漂移。
 *
 * 结构（沿用站内「暗夜荧光」配色，见 src/styles/globals.css 的 .refract-blob）：
 *   .light-field        固定层，pointer-events: none，不拦截任何交互
 *     .light-field__fill   静态兜底渐变：无 JS / reduced-motion 时仍然是完整背景
 *     .light-field__grid  折射源：96px 稀疏网格（直线在玻璃边缘被弯折 = 玻璃里的结构在流动）
 *     .light-field__ruler 折射直尺：288px / 2px 粗线，弯折最可读的一层
 *     .light-field__drift  滚动视差层（vw 幅度）+ CSS 低频自漂移
 *     .light-shadow        暗部层：mix-blend-mode: multiply —— 一层跟随指针的
 *                          暗色径向压暗，「反向光」即亮部让位形成阴影
 *                          （screen 只会变亮，做不出暗部，见 globals.css 同处注释）
 *
 * 性能约束（本卡的核心验收项）：
 *   - 一个 rAF 循环同时服务滚动与指针，不在事件里直接写样式
 *   - 每帧只做「读 → 比较 → 写」，transform 字符串与上次相同就跳过
 *   - 不读布局（无 getBoundingClientRect / offsetHeight），无 layout thrash
 *   - 指针静止 2.4s 后暗部淡出；body.is-scrolling 期间不写暗部
 *   - 全部写入只碰 transform / opacity，交给合成器，不触发 paint
 *
 * 降级：
 *   - prefers-reduced-motion → 全部视差停止，保留静态渐变
 *   - pointer: coarse（触屏）→ 无指针视差，只保留收敛后的滚动视差
 *   - 无 JS / 组件未挂载 → .light-field__fill 的静态渐变仍在
 */

/** 漂移幅度：vw。滚动一整页 = 2×SHIFT_DRIFT vw 的位移。 */
const SHIFT_DRIFT = 6
/** 暗部（指针）幅度：vw。 */
const SHIFT_SHADOW_X = 8
const SHIFT_SHADOW_Y = 6
/** 触屏收敛：滚动更慢、视差更易晕，幅度减半。 */
const COARSE_FACTOR = 0.5
/** 指针静止多久后认为「不再指向」而淡出暗部。 */
const IDLE_MS = 2400

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

export default function DynamicLight() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const drift = root.querySelector<HTMLElement>('.light-field__drift')
    const shadow = root.querySelector<HTMLElement>('.light-shadow')
    if (!drift || !shadow) return

    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')

    let destroyed = false
    let rafId = 0
    let reduced = reduceQuery.matches
    let coarse = coarseQuery.matches

    // 布局缓存：只在 resize 时重算，渲染循环里不碰 layout
    let vw = 1
    let vh = 1
    let maxScroll = 1

    let scrollP = 0
    let lastScroll = Number.NaN

    const pointer = { x: 0.5, y: 0.5, active: false }
    let lastMove = -Infinity

    // 上一次写入的字符串：相同就跳过，避免无谓的样式写入
    let driftApplied = ''
    let shadowApplied = ''
    // 暗部当前透明度（0..1），用于淡入淡出
    let shadowOpacity = 0

    function measure() {
      vw = window.innerWidth || 1
      vh = window.innerHeight || 1
      const doc = document.documentElement
      maxScroll = Math.max(1, doc.scrollHeight - vh)
    }

    function readScroll() {
      const y = window.scrollY
      if (y === lastScroll) return
      lastScroll = y
      scrollP = clamp01(y / maxScroll)
    }

    function frame(now: number) {
      if (destroyed) return
      rafId = requestAnimationFrame(frame)

      readScroll()

      const scrolling = document.body.classList.contains('is-scrolling')
      const scale = coarse ? COARSE_FACTOR : 1

      // ---- 漂移层：滚动视差 + 低频自漂移 ----
      // 自漂移用 CSS 动画周期取余数，时间不累积、无漂移误差
      let dx = 0
      let dy = 0
      if (!reduced) {
        dy = (scrollP - 0.5) * 2 * SHIFT_DRIFT * scale
        const period = 46
        const t = ((now / 1000) % period) / period
        dy += Math.sin(t * Math.PI * 2) * 2.5
        dx = Math.cos(t * Math.PI * 2) * 3
      }
      const driftNext = `translate3d(${dx.toFixed(2)}vw, ${dy.toFixed(2)}vh, 0)`
      if (driftNext !== driftApplied) {
        driftApplied = driftNext
        drift.style.transform = driftNext
      }

      // ---- 暗部层：指针视差 + 淡入淡出 ----
      const wantShadow = !reduced && pointer.active && !scrolling && now - lastMove < IDLE_MS
      const target = wantShadow ? 1 : 0
      if (shadowOpacity !== target) {
        // 指数趋近：约 300ms 收敛，避免开关式跳变
        shadowOpacity = target === 1
          ? Math.min(1, shadowOpacity + 0.18)
          : Math.max(0, shadowOpacity - 0.14)
        if (target === 0 && shadowOpacity < 0.001) shadowOpacity = 0
        shadow.style.opacity = shadowOpacity.toFixed(3)
        if (shadowOpacity === 0 && target === 0) {
          shadowApplied = ''
          shadow.style.transform = 'none'
        }
      }

      if (shadowOpacity > 0) {
        const px = (pointer.x - 0.5) * 2 * SHIFT_SHADOW_X * scale
        const py = (pointer.y - 0.5) * 2 * SHIFT_SHADOW_Y * scale
        const shadowNext = `translate3d(${px.toFixed(2)}vw, ${py.toFixed(2)}vh, 0)`
        if (shadowNext !== shadowApplied) {
          shadowApplied = shadowNext
          shadow.style.transform = shadowNext
        }
      }
    }

    // ---- 输入：只记录，不写样式 ----

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = clamp01(e.clientX / vw)
      pointer.y = clamp01(e.clientY / vh)
      pointer.active = true
      lastMove = performance.now()
    }

    const onPointerLeave = () => {
      pointer.active = false
    }

    const onResize = () => {
      measure()
      lastScroll = Number.NaN
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduced = e.matches
      // 视差立即停住：清掉上一次写入，让下一帧按新状态重算
      driftApplied = ''
      shadowApplied = ''
      shadowOpacity = 0
      drift.style.transform = 'none'
      shadow.style.transform = 'none'
      shadow.style.opacity = '0'
      // 折射源（网格 / 直尺）走 CSS 动画，reduced-motion 由媒体查询关掉；
      // 内联的 animationPlayState 会盖过媒体查询，这里显式复位，保证改设置后真的停。
      root.querySelectorAll<HTMLElement>('.light-field__grid, .light-field__ruler').forEach((layer) => {
        layer.style.animationPlayState = e.matches ? 'paused' : ''
      })
    }

    const onCoarseChange = (e: MediaQueryListEvent) => {
      coarse = e.matches
      pointer.active = false
      driftApplied = ''
    }

    measure()
    // 首帧即应用当前系统偏好：reduced-motion 用户不进 rAF，折射源必须在挂载时就停
    if (reduced) {
      root.querySelectorAll<HTMLElement>('.light-field__grid, .light-field__ruler').forEach((layer) => {
        layer.style.animationPlayState = 'paused'
      })
    }
    rafId = requestAnimationFrame(frame)

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    reduceQuery.addEventListener('change', onMotionChange)
    coarseQuery.addEventListener('change', onCoarseChange)

    return () => {
      destroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      reduceQuery.removeEventListener('change', onMotionChange)
      coarseQuery.removeEventListener('change', onCoarseChange)
    }
  }, [])

  return (
    <div ref={rootRef} className="light-field" aria-hidden="true">
      <div className="light-field__fill" />
      <div className="light-field__grid" />
      <div className="light-field__ruler" />
      <div className="light-field__drift" />
      <div className="light-shadow" />
    </div>
  )
}
