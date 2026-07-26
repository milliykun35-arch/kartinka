"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatPrice, cleanImageUrl } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  index?: number
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, index = 0, viewMode = "grid" }: ProductCardProps) {
  const { lang, t } = useLanguage()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const name = lang === "uz" ? product.name_uz : product.name_ru

  useEffect(() => {
    const fingerprint = localStorage.getItem("user_fingerprint") || crypto.randomUUID()
    localStorage.setItem("user_fingerprint", fingerprint)

    fetch(`/api/favorites?userFingerprint=${fingerprint}`)
      .then((res) => res.json())
      .then((favorites) => {
        if (Array.isArray(favorites)) {
          setIsFavorite(favorites.includes(product.id))
        }
      })
      .catch(() => {})
  }, [product.id])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoading) return

    setIsLoading(true)
    const fingerprint = localStorage.getItem("user_fingerprint") || crypto.randomUUID()

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, userFingerprint: fingerprint }),
      })
      const data = await res.json()
      setIsFavorite(data.favorited)
    } catch (err) {
      console.error(err)
    }
    setIsLoading(false)
  }

  const getBadgeInfo = () => {
    const badges = []

    if (product.discount_percentage && product.discount_percentage > 0) {
      badges.push({
        text: `-${product.discount_percentage}%`,
        className: "bg-red-500 text-white",
      })
    }

    if (product.badge && product.badge.trim() !== "") {
      let badgeClass = "bg-[#7C5C3E] text-white"
      const badgeLower = product.badge.toLowerCase()
      if (badgeLower.includes("top") || badgeLower.includes("хит")) {
        badgeClass = "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
      } else if (badgeLower.includes("yangi") || badgeLower.includes("новинка") || badgeLower.includes("new")) {
        badgeClass = "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      } else if (badgeLower.includes("eksklyuziv") || badgeLower.includes("qo'l ishi")) {
        badgeClass = "bg-gradient-to-r from-purple-600 to-amber-600 text-white"
      }

      badges.push({
        text: product.badge,
        className: badgeClass,
      })
    }

    return badges
  }

  const badges = getBadgeInfo()
  const displayPrice = product.own_store_price || product.price
  const imgUrl = cleanImageUrl((product.image_urls && product.image_urls[0]) || product.image_url)

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#7C5C3E]/50"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Link href={`/product/${product.id}`} className="block h-full flex-1 group">
        {/* Mobile-optimized 4/5 Aspect Ratio Frame */}
        <div
          className="relative w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60"
          style={{ aspectRatio: "4/5" }}
        >
          <img
            src={imgUrl}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = `https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900`
            }}
          />

          {badges.length > 0 && (
            <div className="absolute left-1.5 top-1.5 sm:left-3 sm:top-3 flex flex-col gap-1 z-10">
              {badges.slice(0, 2).map((badge, idx) => (
                <Badge
                  key={idx}
                  className={`${badge.className} text-[9px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 shadow-sm backdrop-blur-md`}
                >
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}

          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute right-1.5 top-1.5 sm:right-3 sm:top-3 z-10 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-md transition-all ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
          >
            <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorite ? "fill-red-500" : ""}`} />
          </button>
        </div>

        {/* Info Area optimized for mobile */}
        <div className="flex flex-col p-2.5 sm:p-4 gap-1 sm:gap-2 flex-1">
          <h3 className="text-xs sm:text-base font-bold text-foreground line-clamp-2 leading-tight group-hover:text-[#7C5C3E]">
            {name}
          </h3>

          <div className="mt-auto pt-1 sm:pt-2">
            <p className="text-[9px] sm:text-xs font-semibold text-muted-foreground tracking-tight mb-0.5">
              {t("Boshlang'ich:", "От:")}
            </p>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-sm sm:text-xl font-black text-[#7C5C3E]">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-[10px] sm:text-xs text-[#7C5C3E] font-bold">
                {t("so'm", "сум")}
              </span>
            </div>

            {product.old_price && product.old_price > displayPrice && (
              <p className="text-[10px] sm:text-xs text-red-500 line-through mt-0.5 font-semibold">
                {formatPrice(product.old_price)} {t("so'm", "сум")}
              </p>
            )}
          </div>
        </div>
      </Link>

      <div className="p-2.5 sm:p-4 pt-0">
        <Button
          asChild
          className="w-full bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white font-bold h-8 sm:h-11 rounded-lg sm:rounded-xl text-[11px] sm:text-sm shadow-md shadow-[#7C5C3E]/20"
        >
          <Link href={`/product/${product.id}`}>
            <ShoppingCart className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t("Tanlash", "Выбрать")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
