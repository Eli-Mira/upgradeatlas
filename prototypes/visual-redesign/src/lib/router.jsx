/* history-based router used by the isolated prototypes only.
   Real, linkable URLs: /, /laptops, /calculator with optional ?lang= */
import { useCallback, useEffect, useState } from 'react'

function currentPath() {
  return window.location.pathname || '/'
}

export function useRoute() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onPop = () => setPath(currentPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (to === currentPath()) return
    if (replace) window.history.replaceState({}, '', to)
    else window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  return { path, navigate }
}

export function matchRoute(path) {
  const [route] = path.split('?')
  const segments = route.split('/').filter(Boolean)
  return { name: segments[0] ?? 'home', param: segments[1] ?? null }
}

export function Link({ to, navigate, children, className, ...rest }) {
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
