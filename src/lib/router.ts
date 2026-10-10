import { useEffect, useState } from 'react'

/** Minimal hash router: GitHub Pages can't rewrite paths, so routes live after `#`. */
export function useRoute(): string {
  const [route, setRoute] = useState(readHash)
  useEffect(() => {
    const onChange = () => setRoute(readHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(path: string) {
  window.location.hash = path
}

function readHash(): string {
  return window.location.hash.replace(/^#/, '') || '/'
}
