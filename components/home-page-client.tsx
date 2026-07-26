"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroCarousel } from "@/components/hero-carousel"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"
import { SnowEffect } from "@/components/snow-effect"
import type { Product, CarouselSlide, StoreSettings } from "@/lib/types"

interface HomePageClientProps {
  products: Product[]
  slides: CarouselSlide[]
  settings: StoreSettings | null
}

export function HomePageClient({ products, slides, settings }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [displayProducts, setDisplayProducts] = useState<Product[]>(products)
  const [displaySlides, setDisplaySlides] = useState<CarouselSlide[]>(slides)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localProds = JSON.parse(localStorage.getItem("local_products") || "[]")
      if (localProds.length > 0) {
        const merged = [...localProds, ...products.filter((p) => !localProds.some((lp: any) => lp.id === p.id))]
        setDisplayProducts(merged)
      } else {
        setDisplayProducts(products)
      }

      const localSlides = JSON.parse(localStorage.getItem("local_slides") || "[]")
      if (localSlides.length > 0) {
        const mergedSlides = [...localSlides, ...slides.filter((s) => !localSlides.some((ls: any) => ls.id === s.id))]
        setDisplaySlides(mergedSlides)
      } else {
        setDisplaySlides(slides)
      }
    }
  }, [products, slides])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {settings?.snow_effect_enabled && <SnowEffect />}
      <Header settings={settings} onSearch={setSearchQuery} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 md:px-12 lg:px-16">
        {!searchQuery && <HeroCarousel slides={displaySlides} />}
        <ProductGrid products={displayProducts} searchQuery={searchQuery} />
      </main>
      <Footer settings={settings} />
    </div>
  )
}
