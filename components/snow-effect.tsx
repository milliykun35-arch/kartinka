"use client"

import { useEffect, useState } from "react"

interface Snowflake {
  id: number
  left: number
  animationDuration: number
  opacity: number
  size: number
}

export function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    const flakes: Snowflake[] = []
    for (let i = 0; i < 50; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: Math.random() * 3 + 5,
        opacity: Math.random() * 0.6 + 0.4,
        size: Math.random() * 4 + 2,
      })
    }
    setSnowflakes(flakes)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-fall"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            opacity: flake.opacity,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
            <path d="M12 2L9 8H6L12 12L6 16H9L12 22L15 16H18L12 12L18 8H15L12 2Z" />
          </svg>
        </div>
      ))}
    </div>
  )
}
