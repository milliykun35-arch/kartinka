"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useLanguage } from "@/lib/language-context"
import type { Product, StoreSettings } from "@/lib/types"
import { Heart } from "lucide-react"

interface FavoritesPageClientProps {
  products: Product[]
  settings: StoreSettings | null
}

export function FavoritesPageClient({ products, settings }: FavoritesPageClientProps) {
  const { t } = useLanguage()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      const fingerprint = localStorage.getItem("user_fingerprint") || crypto.randomUUID()
      if (!localStorage.getItem("user_fingerprint")) {
        localStorage.setItem("user_fingerprint", fingerprint)
      }

      try {
        const response = await fetch(`/api/favorites?user_fingerprint=${fingerprint}`)
        if (response.ok) {
          const data = await response.json()
          setFavoriteIds(new Set(data.favorites.map((f: any) => f.product_id)))
        }
      } catch (error) {
        console.error("Failed to load favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const favoriteProducts = products.filter((product) => favoriteIds.has(product.id))

  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} />
      <main className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#5200BB] to-[#7c3aed] shadow-lg">
              <Heart className="h-8 w-8 fill-white text-white" />
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-[#5200BB] to-[#7c3aed] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              {t("Sevimli mahsulotlar", "Избранные товары")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {favoriteProducts.length > 0
                ? t(`${favoriteProducts.length} ta sevimli mahsulot`, `${favoriteProducts.length} избранных товаров`)
                : t("Sevimli mahsulotlar yo'q", "Нет избранных товаров")}
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-muted/50" />
              ))}
            </div>
          ) : favoriteProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 rounded-full bg-muted/50 p-8">
                <Heart className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">{t("Sevimli mahsulotlar yo'q", "Нет избранных товаров")}</h3>
              <p className="mb-8 text-center text-muted-foreground">
                {t(
                  "Mahsulot kartasidagi yurakcha belgisini bosib sevimlilaringizga qo'shing",
                  "Нажмите на значок сердца на карточке товара, чтобы добавить в избранное",
                )}
              </p>
              <a
                href="/#products"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5200BB] to-[#7c3aed] px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {t("Mahsulotlarni ko'rish", "Посмотреть товары")}
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  )
}
