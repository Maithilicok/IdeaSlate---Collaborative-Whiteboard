import { useEffect, useState } from 'react'

export default function PageTransition({ children }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setActive(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={`page-transition ${active ? 'page-transition-active' : ''}`}>
      {children}
    </div>
  )
}
