// components/DinoGame.tsx
'use client'

import { useEffect, useRef } from 'react'

interface Props {
  started: boolean
}

export default function DinoGame({ started }: Props) {
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (!started || !containerRef.current) return

    // Dynamically import the game script (from public/assets/js/index1.js or similar)
    const script = document.createElement('script')
    script.src = '/assets/js/index1.js'   // ← adjust path
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [started])

  return (
    <div
      ref={containerRef}
      id="main-frame-error"
      className="interstitial-wrapper"
      style={{ height: '100%', width: '100%' }}
    />
  )
}