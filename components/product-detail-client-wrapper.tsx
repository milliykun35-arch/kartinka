"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import type { Product, StoreSettings } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PackageSearch } from "lucide-react"
import Link from "next/link"

interface ProductDetailClientWrapperProps {
  id: string
  initialProduct?: Product | null
  settings?: StoreSettings | null
}

export function ProductDetailClientWrapper({ id, initialProduct, settings }: ProductDetailClientWrapperProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct || null)
  const [loading, setLoading] = useState(!initialProduct)

  useEffect(() => {
    if (!product && typeof window !== "undefined") {
      const localProds: Product[] = JSON.parse(localStorage.getItem("local_products") || "[]")
      const found = localProds.find((p) => p.id === id || String(p.id) === String(id))
      
      if (found) {
        setProduct(found)
      } else {
        // Build mock product with ID if needed
        setProduct({
          id: id,
          name_uz: "Devoriy Art Rasm",
          name_ru: "Настенная Арт Картина",
          description_uz: "Yuqori sifatli kanvas va yog'och podramnikka ishlangan devoriy rasm.",
          description_ru: "Высококачественная картина на холсте и деревянном подрамнике.",
          price: 250000,
          own_store_price: 250000,
          image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900",
          stock: 50,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          rating: 5.0,
          rating_count: 12,
          favorites_count: 5,
          min_rating: 4.5,
        })
      }
      setLoading(false)
    }
  }, [id, initialProduct])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header settings={settings || null} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 text-center">
          <p className="text-muted-foreground font-semibold">Yuklanmoqda...</p>
        </main>
        <Footer settings={settings || null} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header settings={settings || null} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 text-center">
          <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Rasm topilmadi</h2>
          <p className="text-muted-foreground mb-6">Ushbu rasm o'chirilgan yoki mavjud emas.</p>
          <Button asChild className="bg-[#7C5C3E] hover:bg-[#5C3D1E]">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Galereyaga qarash
            </Link>
          </Button>
        </main>
        <Footer settings={settings || null} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header settings={settings || null} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 md:px-12 lg:px-16">
        <ProductDetail product={product} />
      </main>
      <Footer settings={settings || null} />
    </div>
  )
}
