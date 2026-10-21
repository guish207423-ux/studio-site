export function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
