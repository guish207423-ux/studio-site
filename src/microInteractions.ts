/**
 * Micro-interactions — BRAND §3.3 玻璃家族微动效语言
 *
 * 这里原来用 GSAP 逐帧补间（11 处 gsap.to / fromTo）。现在改成
 * 「JS 写 CSS 变量 + CSS transition / keyframes 执行」：主线程只在 pointermove
 * 里算一次坐标，动画本体交给 compositor。gsap 因此从首屏依赖图里彻底消失
 * （它此前挂在 index.tsx → microInteractions.ts 这条链上，入场补间见各 section
 * 组件里的 gsap.context / ScrollTrigger.batch）。
 *
 * 视觉等价性：位移量、时长、激活区间都按原数值保留，缓动从 elastic 换成
 * 等向的 cubic-bezier（elastic 的过冲幅度在 CSS 里没有直接对应，取最接近的一条）。
 */

import { canHover } from './lib/motion'

export function setupMicroInteractions() {
  // 触屏没有 hover，reduced-motion 下也不该注册「非用户主动触发的动效」。
  if (!canHover()) return

  // 1. 卡片浮起 / 2. 按钮按压 —— 纯 CSS，已分别在 .glass-float:hover 与
  //    .btn:active 里。原先这里用 gsap.to 写 inline transform 盖住 CSS，
  //    但两条路径的数值本来就一致（-10px / translateZ(14px)），
  //    交给 CSS 反而少一次 inline style 与样式表的优先级争夺。

  // 3. 点击涟漪：元素得由 JS 按指针位置创建，扩散动画走 keyframes。
  document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
    btn.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0) return
      const rect = btn.getBoundingClientRect()
      const ripple = document.createElement('span')
      ripple.className = 'btn-ripple'
      ripple.style.left = `${e.clientX - rect.left}px`
      ripple.style.top = `${e.clientY - rect.top}px`
      btn.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
    })
  })

  // 4. 磁吸：JS 只把指针相对按钮中心的偏移写进 CSS 变量。
  document.querySelectorAll<HTMLElement>('.btn--primary, .nav__cta').forEach((btn) => {
    const el = btn as HTMLElement
    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const strength = 0.15
      el.style.setProperty('--mx', `${(e.clientX - rect.left - rect.width / 2) * strength}px`)
      el.style.setProperty('--my', `${(e.clientY - rect.top - rect.height / 2) * strength}px`)
    })
    el.addEventListener('mouseleave', () => {
      el.style.removeProperty('--mx')
      el.style.removeProperty('--my')
    })
  })

  // 5. 卡面张力：横向跟随指针拉伸（200px 激活区），同样只写变量。
  document.querySelectorAll<HTMLElement>('.service-card, .work-card').forEach((card) => {
    const el = card as HTMLElement
    const maxDist = 200
    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const dist = Math.abs(e.clientX - rect.left - rect.width / 2)
      if (dist > maxDist) return
      const stretch = 0.85 + (1 - dist / maxDist) * 0.15
      el.style.setProperty('--sx', stretch.toFixed(3))
      el.style.setProperty('--sy', (2 - stretch).toFixed(3))
    })
    el.addEventListener('mouseleave', () => {
      el.style.removeProperty('--sx')
      el.style.removeProperty('--sy')
    })
  })

  // 6. 触点光晕：只写变量，渐变本体在 CSS 的 .btn::after 里。
  document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
    const el = btn as HTMLElement
    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--btn-spec-x', `${e.clientX - rect.left}px`)
      el.style.setProperty('--btn-spec-y', `${e.clientY - rect.top}px`)
    })
  })

  // 7. 标签页不可见时暂停背景光层动画，避免滤镜空转。
  const driftLayers = document.querySelectorAll(
    '.light-field__drift, .light-field__grid, .light-field__ruler',
  )
  const pauseRefractAnimations = (hidden: boolean) => {
    driftLayers.forEach((el) => {
      ;(el as HTMLElement).style.animationPlayState = hidden ? 'paused' : 'running'
    })
  }
  document.addEventListener('visibilitychange', () => pauseRefractAnimations(document.hidden))
}
