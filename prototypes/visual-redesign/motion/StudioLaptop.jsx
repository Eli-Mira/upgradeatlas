import { useEffect, useRef, useState } from 'react'
import './StudioLaptop.css'

const desktopPoster = new URL('../assets/hero-desktop.webp', import.meta.url).href
const mobilePoster = new URL('../assets/hero-mobile.webp', import.meta.url).href

export default function StudioLaptop({locale = 'en'}) {
  const canvas = useRef(null)
  const view = useRef(null)
  const angle = useRef(0)
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const t = (en, ar) => locale === 'ar' ? ar : en

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { setReduced(media.matches); if (media.matches) setActive(false) }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (!active || reduced) return
    let cancelled = false
    let studio
    let observer
    setReady(false); setError(false); angle.current = 0
    import('./studio.js').then(({buildStudio}) => {
      if (cancelled) return
      const element = canvas.current
      studio = buildStudio({canvas: element, width: element.clientWidth || 640,
        height: element.clientHeight || 480, dpr: window.devicePixelRatio})
      studio.camera = studio.applyPreset(element.clientWidth < 480 ? 'hero-mobile' : 'hero-desktop')
      view.current = studio
      const resize = () => {
        const width = Math.max(element.clientWidth, 1), height = Math.max(element.clientHeight, 1)
        studio.renderer.setSize(width, height, false)
        studio.camera.aspect = width / height
        studio.camera.updateProjectionMatrix()
        studio.renderer.render(studio.scene, studio.camera)
      }
      observer = new ResizeObserver(resize); observer.observe(element)
      resize(); setReady(true)
    }).catch(() => { if (!cancelled) { setError(true); setActive(false) } })
    return () => {
      cancelled = true; observer?.disconnect(); studio?.dispose(); view.current = null
    }
  }, [active, reduced])

  function rotate(delta) {
    const studio = view.current
    if (!studio) return
    angle.current = delta === null ? 0 : angle.current + delta
    studio.laptop.rotation.y = -.18 + angle.current
    studio.renderer.render(studio.scene, studio.camera)
  }
  function keys(event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); rotate(.18) }
    if (event.key === 'ArrowRight') { event.preventDefault(); rotate(-.18) }
    if (event.key.toLowerCase() === 'r') rotate(null)
  }
  return <div className="studio-laptop" data-inspect-ready={active && ready}>
    <picture className="studio-poster" hidden={active && ready}>
      <source media="(max-width: 768px)" srcSet={mobilePoster} />
      <img src={desktopPoster} width="1920" height="1080" fetchPriority="high"
        alt={t('Original graphite laptop concept, not a specific retail model', 'تصميم توضيحي أصلي للابتوب، وليس صورة لموديل معروض للبيع')} />
    </picture>
    <canvas ref={canvas} className="studio-canvas" hidden={!active || reduced}
      style={{visibility: active && ready ? 'visible' : 'hidden'}} tabIndex={active && ready ? 0 : -1}
      onKeyDown={keys} role="img" aria-label={t('Interactive concept laptop. Use arrow keys to rotate; R to reset.', 'نموذج توضيحي تفاعلي. استخدم الأسهم للتدوير وحرف R لإعادة الضبط.')} />
    {active && !ready && <p className="studio-status" role="status">{t('Loading concept…', 'جارٍ تحميل النموذج…')}</p>}
    {error && <p className="studio-status" role="alert">{t('3D unavailable. The still image remains available.', 'العرض التفاعلي غير متاح. الصورة الثابتة ما زالت متاحة.')}</p>}
    {!active && !reduced && <button className="studio-inspect" onClick={() => setActive(true)}>{t('Inspect concept', 'افحص التصميم')}</button>}
    {active && <div className="studio-controls" aria-label={t('Concept controls', 'التحكم في النموذج')}>
      <button aria-label={t('Show static poster', 'اعرض الصورة الثابتة')} onClick={() => {setActive(false); setReady(false)}}>{t('Close 3D', 'أغلق العرض')}</button>
      <button aria-label={t('Rotate left', 'دوّر لليسار')} onClick={() => rotate(.18)}>←</button>
      <button aria-label={t('Rotate right', 'دوّر لليمين')} onClick={() => rotate(-.18)}>→</button>
      <button aria-label={t('Reset rotation', 'أعد ضبط التدوير')} onClick={() => rotate(null)}>{t('Reset', 'إعادة ضبط')}</button>
    </div>}
  </div>
}
