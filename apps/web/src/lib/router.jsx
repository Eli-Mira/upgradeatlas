import { useCallback, useEffect, useState } from 'react'

/**
 * Small History-API router. Four routes with real URLs, no dependency.
 * Real URLs matter here: a laptop page must be linkable and shareable.
 *
 * shortcut: no nested routes, no route params beyond one segment, no scroll
 * restoration per entry. Upgrade to a router library when the site needs
 * code-split routes or nested layouts.
 */

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

/** Split "/laptops/EX-C15-01" into { name: 'laptops', param: 'EX-C15-01' }. */
export function matchRoute(path) {
  const segments = path.split('/').filter(Boolean)
  return { name: segments[0] ?? 'home', param: segments[1] ? decodeURIComponent(segments[1]) : null }
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
