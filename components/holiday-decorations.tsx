"use client"

import { useEffect, useState } from "react"

export function HolidayDecorations() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Christmas lights top */}
      <div className="absolute left-0 right-0 top-0 flex justify-around">
        {[...Array(20)].map((_, i) => (
          <div
            key={`light-top-${i}`}
            className="h-3 w-3 rounded-full animate-pulse"
            style={{
              background: ["#ff0000", "#00ff00", "#ffff00", "#ff00ff", "#00ffff"][i % 5],
              animationDelay: `${i * 0.2}s`,
              boxShadow: `0 0 10px ${["#ff0000", "#00ff00", "#ffff00", "#ff00ff", "#00ffff"][i % 5]}`,
            }}
          />
        ))}
      </div>

      {/* Snowflakes */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`snowflake-${i}`}
          className="absolute animate-fall text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        >
          ❄️
        </div>
      ))}

      {/* Christmas ornaments - corners */}
      <div className="absolute left-4 top-20 animate-swing text-4xl">🎄</div>
      <div className="absolute right-4 top-20 animate-swing-reverse text-4xl" style={{ animationDelay: "1s" }}>
        🎁
      </div>
      <div className="absolute left-4 bottom-20 animate-bounce text-4xl" style={{ animationDelay: "2s" }}>
        ⛄
      </div>
      <div className="absolute right-4 bottom-20 animate-bounce text-4xl" style={{ animationDelay: "3s" }}>
        🎅
      </div>
    </div>
  )
}
