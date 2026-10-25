import gsap from 'gsap'

// ============================================================================
// Micro-interactions — BRAND §3.3 玻璃家族微动效语言
// ============================================================================

import { isReducedMotion } from './lib/motion'

export function setupMicroInteractions() {
  const reduced = isReducedMotion()
  const coarse = window.matchMedia('(hover: none)').matches
  if (reduced || coarse) return

  // 1. Card hover lift —— GSAP 写 inline transform，会盖过 CSS 的
  //    .glass-float:hover（inline 优先级最高），所以 JS 是卡片浮起的真源。
  //    幅度与 CSS 侧一致（-10px）：两条路径必须同值，否则「有没有 JS」看起来不一样。
  document.querySelectorAll('.service-card, .work-card').forEach(card => {
    const el = card as HTMLElement
    card.addEventListener('mouseenter', () => {
      gsap.to(el, { y: -10, z: 14, duration: 0.35, ease: 'elastic.out(1, 0.45)' })
    })
    card.addEventListener('mouseleave', () => {
      gsap.to(el, { y: 0, z: 0, duration: 0.4, ease: 'elastic.out(1, 0.45)' })
    })
  })

  // 2. Button press: squash + elastic rebound
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0) return
      gsap.to(btn, {
        scaleX: 1.06, scaleY: 0.94, y: 1,
        boxShadow: '0 1px 2px rgba(0,0,0,.3)',
        duration: 0.1,
        ease: 'power1.out',
      })
    })

    const release = () => {
      gsap.to(btn, {
        scaleX: 1, scaleY: 1, y: 0,
        boxShadow: 'var(--sh-2)',
        duration: 0.55,
        ease: 'elastic.out(1, 0.45)',
      })
    }

    btn.addEventListener('pointerup', release)
    btn.addEventListener('pointercancel', release)
    btn.addEventListener('pointerleave', release)
  })

  // 3. Click ripple on buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0) return
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const ripple = document.createElement('span')
      ripple.className = 'btn-ripple'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      btn.appendChild(ripple)

      gsap.fromTo(ripple,
        { scale: 0, opacity: 0.5 },
        {
          scale: 1.8, opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      )
    })
  })

  // 4. Panel hover tension + lift（表面张力微膨胀 + 轻微浮起）
  //    只作用于「内容面板」：.glass-nav 是 fixed 且靠内联 translateX(-50%) 居中，
  //    GSAP 写 transform 会把百分比位移换算成 px，导航立刻偏位 —— 必须排除。
  //    玻璃面板的 hover 浮起只能在 JS 里做（CSS :hover transform 会被这里的
  //    inline transform 覆盖，inline 优先级最高）。
  document.querySelectorAll('.glass-contact, .hero-panel').forEach(panel => {
    const el = panel as HTMLElement
    panel.addEventListener('mouseenter', () => {
      gsap.to(el, {
        scaleX: 1.015, scaleY: 1.01, y: -6,
        duration: 0.45,
        ease: 'elastic.out(1, 0.45)',
      })
    })
    panel.addEventListener('mouseleave', () => {
      gsap.to(el, {
        scaleX: 1, scaleY: 1, y: 0,
        duration: 0.45,
        ease: 'elastic.out(1, 0.45)',
      })
    })
  })

  // 5. Magnetic effect on nav CTA and primary buttons
  document.querySelectorAll('.btn--primary, .nav__cta').forEach(btn => {
    const el = btn as HTMLElement
    const strength = 0.15
    btn.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      })
    })
    btn.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0, y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.45)',
      })
    })
  })

  // 6. Directional elastic stretch on cards (200px activation zone)
  document.querySelectorAll('.service-card, .work-card').forEach(card => {
    const el = card as HTMLElement
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const centerX = rect.width / 2
      const dist = Math.abs(x - centerX)
      const maxDist = 200
      if (dist > maxDist) return

      const stretch = 0.85 + (1 - dist / maxDist) * 0.15
      gsap.to(el, {
        scaleX: stretch,
        scaleY: 2 - stretch,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    })
    card.addEventListener('mouseleave', () => {
      gsap.to(el, {
        scaleX: 1, scaleY: 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.45)',
      })
    })
  })

  // 7. Button hover halo (触点光晕)
  document.querySelectorAll('.btn').forEach(btn => {
    const el = btn as HTMLElement
    btn.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--btn-spec-x', `${x}px`)
      el.style.setProperty('--btn-spec-y', `${y}px`)
    })
  })

  // 8. visibilitychange 暂停背景光层动画（v5 的 .refract-blob 已移除）
  //    v6：网格 / 直尺与视差层一起暂停，避免标签页不可见时滤镜空转。
  const driftLayers = document.querySelectorAll(
    ".light-field__drift, .light-field__grid, .light-field__ruler",
  )
  function pauseRefractAnimations(hidden: boolean) {
    driftLayers.forEach(el => {
      if (hidden) { (el as HTMLElement).style.animationPlayState = "paused"; }
      else { (el as HTMLElement).style.animationPlayState = "running"; }
    })
  }
  document.addEventListener("visibilitychange", () => pauseRefractAnimations(document.hidden))
}
