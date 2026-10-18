/* Reveal on scroll — lightweight intersection observer.
   Respects reduced motion: elements immediately visible. */
import { useEffect, useRef, useState } from 'react'

export default function Reveal({ as: Tag = 'div', delay = 0, children, className, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShown(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'data-shown="true"' : ''} ${className ?? ''}`}
      data-shown={shown}
      {...rest}
    >
      {children}
    </Tag>
  )
}