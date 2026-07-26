"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"
import { SnowEffect } from "@/components/snow-effect"
import type { Product, StoreSettings, SortOption, ProductFilters } from "@/lib/types"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Filter, X, SlidersHorizontal, Grid3x3, List, TrendingUp, Sparkles, Star, Package } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

interface ProductsPageClientProps {
  products: Product[]
  settings: StoreSettings | null
}

export function ProductsPageClient({ products, settings }: ProductsPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, lang } = useLanguage()

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filters, setFilters] = useState<ProductFilters>(() => ({}))
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [displayProducts, setDisplayProducts] = useState<Product[]>(products)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localProds = JSON.parse(localStorage.getItem("local_products") || "[]")
      if (localProds.length > 0) {
        const merged = [...localProds, ...products.filter((p) => !localProds.some((lp: any) => lp.id === p.id))]
        setDisplayProducts(merged)
      } else {
        setDisplayProducts(products)
      }
    }
  }, [products])

  const priceRange = useMemo(() => {
    const prices = displayProducts.map((p) => p.price)
    return {
      min: prices.length ? Math.floor(Math.min(...prices) / 1000) * 1000 : 0,
      max: prices.length ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 1000000,
    }
  }, [displayProducts])

  const filteredProducts = useMemo(() => {
    const result = displayProducts.filter((product) => {
      const name = lang === "uz" ? product.name_uz : product.name_ru
      const matchesSearch = searchQuery ? name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      const matchesPrice =
        (filters.minPrice === undefined || product.price >= filters.minPrice) &&
        (filters.maxPrice === undefined || product.price <= filters.maxPrice)
      const matchesRating = filters.minRating === undefined || product.rating >= filters.minRating
      const matchesStock = filters.inStock === undefined || !filters.inStock || (product.stock ?? 0) > 0

      return matchesSearch && matchesPrice && matchesRating && matchesStock
    })

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price_desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
        result.sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0))
        break
      case "newest":
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    return result
  }, [products, searchQuery, filters, sortBy, lang])

  const stats = useMemo(() => {
    return {
      total: filteredProducts.length,
      inStock: filteredProducts.filter((p) => (p.stock ?? 0) > 0).length,
      avgRating: (filteredProducts.reduce((sum, p) => sum + p.rating, 0) / filteredProducts.length).toFixed(1),
    }
  }, [filteredProducts])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {settings?.snow_effect_enabled && <SnowEffect />}
      <Header settings={settings} onSearch={setSearchQuery} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 md:px-12 lg:px-16">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#7C5C3E]/10 via-amber-500/5 to-background p-8 border border-[#7C5C3E]/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-6 w-6 text-[#7C5C3E]" />
                <h1 className="text-4xl font-black text-foreground sm:text-5xl">
                  {t("Barcha rasmlar", "Все картины")}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                {t(
                  `${stats.total} ta mahsulot, ${stats.inStock} ta mavjud`,
                  `${stats.total} товаров, ${stats.inStock} в наличии`,
                )}
              </p>
              {stats.avgRating !== "NaN" && (
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{stats.avgRating}</span>
                  <span className="text-sm text-muted-foreground">{t("O'rtacha reyting", "Средний рейтинг")}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[200px] h-11 bg-background">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {t("Yangi", "Новые")}
                    </div>
                  </SelectItem>
                  <SelectItem value="price_asc">{t("Narx: Arzon", "Цена: Низкая")}</SelectItem>
                  <SelectItem value="price_desc">{t("Narx: Qimmat", "Цена: Высокая")}</SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t("Reyting", "Рейтинг")}
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">{t("Mashhur", "Популярные")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              className={`h-11 gap-2 ${showFilters ? "bg-[#7C5C3E] hover:bg-[#7C5C3E]/90" : ""}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("Filtrlar", "Фильтры")}
              </Button>

              <div className="flex gap-1 border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 rounded-xl border bg-card p-6 shadow-lg animate-in slide-in-from-top-4 duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Filter className="h-5 w-5 text-[#7C5C3E]" />
                {t("Kengaytirilgan filtrlar", "Расширенные фильтры")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({})
                  setSortBy("newest")
                  setSearchQuery("")
                  router.push("/products")
                }}
                className="text-[#7C5C3E] hover:text-[#7C5C3E]/80"
              >
                <X className="mr-2 h-4 w-4" />
                {t("Hammasini tozalash", "Очистить все")}
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t("Narx oralig'i", "Ценовой диапазон")}</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{((filters.minPrice || priceRange.min) / 1000).toFixed(0)}K</span>
                  <span>-</span>
                  <span>{((filters.maxPrice || priceRange.max) / 1000).toFixed(0)}K so'm</span>
                </div>
                <Slider
                  min={priceRange.min}
                  max={priceRange.max}
                  step={10000}
                  value={[filters.minPrice || priceRange.min, filters.maxPrice || priceRange.max]}
                  onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">{t("Minimal reyting", "Минимальный рейтинг")}</Label>
                <Select
                  value={filters.minRating?.toString() || "0"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, minRating: value === "0" ? undefined : Number(value) })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t("Barchasi", "Все")}</SelectItem>
                    <SelectItem value="3">3+ ⭐</SelectItem>
                    <SelectItem value="4">4+ ⭐</SelectItem>
                    <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4">
                <Switch
                  checked={filters.inStock || false}
                  onCheckedChange={(checked) => setFilters({ ...filters, inStock: checked || undefined })}
                  className="data-[state=checked]:bg-[#7C5C3E]"
                />
                <Label className="text-base font-semibold cursor-pointer">
                  {t("Faqat mavjud mahsulotlar", "Только в наличии")}
                </Label>
              </div>
            </div>
          </div>
        )}

        <ProductGrid products={filteredProducts} searchQuery={searchQuery} viewMode={viewMode} />
      </main>

      <Footer settings={settings} />
    </div>
  )
}
