import React from "react"
import Link from "next/link"
import { Palette, Frame } from "lucide-react"

interface BrandLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  withLink?: boolean
}

export function BrandLogo({ className = "", size = "md", withLink = true }: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-4xl",
  }

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6 sm:h-7 sm:w-7",
    lg: "h-8 w-8 sm:h-10 sm:w-10",
  }

  const content = (
    <div className={`flex items-center gap-2.5 group transition-transform hover:scale-[1.03] ${className}`}>
      {/* Icon Frame */}
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5C3E] via-[#A8845C] to-[#5C3D1E] p-2 shadow-lg shadow-[#7C5C3E]/30 ring-2 ring-[#7C5C3E]/20">
        <Frame className={`${iconSizes[size]} text-white transform -rotate-6 transition-transform group-hover:rotate-0`} />
        <Palette className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-amber-300 animate-pulse" />
      </div>

      {/* Modern Sans-Serif Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`font-sans font-black tracking-wider bg-gradient-to-r from-[#5C3D1E] via-[#7C5C3E] to-[#A8845C] dark:from-amber-200 dark:via-amber-400 dark:to-amber-100 bg-clip-text text-transparent uppercase drop-shadow-sm ${sizeClasses[size]}`}
          style={{ fontFamily: "var(--font-outfit), 'Plus Jakarta Sans', var(--font-jakarta), system-ui, sans-serif", letterSpacing: "0.06em" }}
        >
          KARTINKA
        </span>
        <span className="text-[9px] font-sans font-extrabold tracking-widest text-[#7C5C3E]/90 dark:text-amber-300/90 -mt-1 uppercase">
          Devoriy Art Galereya
        </span>
      </div>
    </div>
  )

  if (withLink) {
    return <Link href="/">{content}</Link>
  }

  return content
}
