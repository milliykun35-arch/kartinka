"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import type { Product, ColorVariant } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, Heart, Shield, Truck, Sparkles, ArrowLeft, CheckCircle2, Share2, Frame, Maximize2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Toast } from "@/components/toast"
import { ProductReviews } from "@/components/product-reviews"
import { cn, cleanImageUrl, formatPrice } from "@/lib/utils"
import { PictureCustomizer } from "@/components/picture-customizer"
import { Badge } from "@/components/ui/badge"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Color / Frame variants
  const colorVariants: ColorVariant[] = (product.color_variants || product.colors || []).filter(
    (v: ColorVariant) => v.stock > 0,
  )
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorVariants.length > 0 ? colorVariants[0].color : null,
  )

  // Customization state (Material & Size)
  const [customConfig, setCustomConfig] = useState<{
    material: any
    size: any
    totalPrice: number
  } | null>(null)

  const [isFavorited, setIsFavorited] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const name = lang === "uz" ? product.name_uz : product.name_ru
  const description = lang === "uz" ? product.description_uz : product.description_ru

  const selectedColorVariant = colorVariants.find((v) => v.color === selectedColor)

  // Final Price dynamically calculated from Customizer or product base price
  const displayPrice = customConfig?.totalPrice || product.price

  const rawImages =
    selectedColorVariant?.image_url && selectedColorVariant.image_url !== product.image_url
      ? [selectedColorVariant.image_url, ...(product.image_urls || [product.image_url])]
      : product.image_urls && product.image_urls.length > 0
        ? product.image_urls
        : [product.image_url]

  const images = rawImages.map((img) => cleanImageUrl(img))

  useEffect(() => {
    const userFingerprint = localStorage.getItem("user_fingerprint")
    if (userFingerprint) {
      fetch(`/api/favorites?user_fingerprint=${userFingerprint}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setIsFavorited(data.includes(product.id))
          }
        })
        .catch(() => {})
    }
  }, [product.id])

  const toggleFavorite = async () => {
    const userFingerprint = localStorage.getItem("user_fingerprint") || crypto.randomUUID()
    localStorage.setItem("user_fingerprint", userFingerprint)

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, userFingerprint }),
      })
      const data = await res.json()
      setIsFavorited(data.favorited)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const cartItem = {
      id: `${product.id}-${customConfig?.material?.id || "std"}-${customConfig?.size?.label || "std"}`,
      productId: product.id,
      name,
      price: displayPrice,
      image: images[currentImageIndex] || images[0],
      quantity: 1,
      material: customConfig?.material?.name_uz || "Pechat (Kanvas)",
      size: customConfig?.size?.label || "55x40 cm",
      source: "store",
    }

    const existingIndex = cart.findIndex((item: any) => item.id === cartItem.id)
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cartUpdated"))

    setToastMessage(name)
    setShowToast(true)
  }

  const handleDirectOrder = () => {
    handleAddToCart()
    router.push("/cart")
  }

  return (
    <>
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />

      <div className="space-y-8 pb-20 sm:pb-8">
        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between border-b pb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground h-9 px-2"
          >
            <ArrowLeft className="h-4 w-4 text-[#7C5C3E]" />
            {t("Galereyaga qaytish", "Назад в галерею")}
          </Button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                isFavorited ? "border-red-500 bg-red-50 text-red-500" : "border-border text-gray-500 hover:border-[#7C5C3E]"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: name, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert("Havola nusxalandi!")
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-gray-500 hover:border-[#7C5C3E] transition-all"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Left Artwork Showcase (5 cols), Right Studio Details (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Canvas Showcase */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-4 border-card bg-gradient-to-br from-muted/30 to-muted/60 shadow-2xl shadow-[#7C5C3E]/15 aspect-[4/5]">
              <img
                src={images[currentImageIndex] || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900"}
                alt={name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900"
                }}
              />

              {/* Badge overlay */}
              {product.badge && (
                <div className="absolute left-3 top-3 z-10">
                  <Badge className="bg-[#7C5C3E] text-white font-bold text-xs px-3 py-1 shadow-lg">
                    {product.badge}
                  </Badge>
                </div>
              )}

              {/* Discount Percentage Badge */}
              {product.discount_percentage && product.discount_percentage > 0 && (
                <div className="absolute right-3 top-3 z-10">
                  <Badge className="bg-red-500 text-white font-bold text-xs px-2.5 py-1 shadow-lg">
                    -{product.discount_percentage}%
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border-2 transition-all shrink-0 ${
                      currentImageIndex === idx
                        ? "border-[#7C5C3E] ring-2 ring-[#7C5C3E]/30 scale-105 shadow-md"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Studio Customizer & Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Rating */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C5C3E]">
                <Frame className="h-4 w-4 text-[#7C5C3E]" />
                <span>Kartinka Premium Art Gallery</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-foreground leading-tight">{name}</h1>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">4.9 / 5.0</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">(24 ta xaridor sharhi)</span>
              </div>
            </div>

            {/* Color / Frame Variant Selector (if available) */}
            {colorVariants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  {t("Ramka / Rang variatsiyasi:", "Вариант рамки / цвета:")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.color}
                      type="button"
                      onClick={() => setSelectedColor(variant.color)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedColor === variant.color
                          ? "border-[#7C5C3E] bg-[#7C5C3E] text-white shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-[#7C5C3E]"
                      }`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Picture Customizer Studio Component */}
            <PictureCustomizer basePrice={product.price} onChange={setCustomConfig} />

            {/* Action Buttons (Desktop & Tablet) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                className="h-12 bg-[#7C5C3E] hover:bg-[#5C3D1E] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-[#7C5C3E]/20"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t("Savatga qo'shish", "В корзину")}
              </Button>

              <Button
                onClick={handleDirectOrder}
                className="h-12 bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t("Hozir sotib olish", "Купить сейчас")}
              </Button>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-foreground">{t("100% Sifat kafolati va yog'och podramnik", "100% Гарантия качества")}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                <Truck className="h-5 w-5 text-[#7C5C3E] shrink-0" />
                <span className="font-semibold text-foreground">{t("Tezkor va bexatar yetkazib berish", "Быстрая доставка")}</span>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground">{t("Rasm tavsifi va xususiyatlari", "Описание и характеристики")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t pt-10">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Floating Mobile Sticky Order Bar for Instant Ordering */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-background/95 p-3 backdrop-blur-xl sm:hidden shadow-2xl">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("Jami narx:", "Итого:")}</p>
          <p className="text-base font-black text-[#7C5C3E]">
            {formatPrice(displayPrice)} <span className="text-[10px] font-bold">{t("so'm", "сум")}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="h-10 px-3 border-[#7C5C3E] text-[#7C5C3E] font-bold rounded-xl text-xs"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDirectOrder}
            className="h-10 px-4 bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] text-white font-bold text-xs rounded-xl shadow-md"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            {t("Sotib olish", "Купить")}
          </Button>
        </div>
      </div>
    </>
  )
}
