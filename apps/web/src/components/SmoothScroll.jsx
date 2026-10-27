import { useEffect } from 'react'

/**
 * Lenis smooth scroll for pointer devices only.
 *
 * Touch keeps native scrolling (syncTouch stays off) and reduced-motion users
 * get no smoothing at all. The instance is destroyed on unmount, so nothing
 * survives a route change.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (reduced || coarse) return undefined

    let lenis
    let cancelled = false

    import('lenis')
      .then(({ default: Lenis }) => {
        if (cancelled) return
        lenis = new Lenis({
          duration: 1.05,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          syncTouch: false,
        })
      })
      .catch(() => {
        // Smoothing is an enhancement. If the chunk fails, native scroll stands.
      })

    return () => {
      cancelled = true
      lenis?.destroy()
      lenis = null
    }
  }, [])

  return null
}
