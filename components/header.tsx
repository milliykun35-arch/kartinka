"use client"

import type React from "react"
import { useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { X, Search, Heart, ShoppingCart, User, Clock, Home, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { StoreSettings } from "@/lib/types"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  settings: StoreSettings | null
  onSearch?: (query: string) => void
}

export function Header({ settings, onSearch }: HeaderProps) {
  const { lang, setLang, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [liveSearchResults, setLiveSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [cartPulse, setCartPulse] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const bannerText = lang === "uz" ? settings?.banner_text_uz : settings?.banner_text_ru

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const items = JSON.parse(savedCart)
        const totalCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        if (totalCount > cartCount) {
          setCartPulse(true)
          setTimeout(() => setCartPulse(false), 600)
        }
        setCartCount(totalCount)
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()
    const interval = setInterval(updateCartCount, 500)
    return () => clearInterval(interval)
  }, [cartCount])

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (userData) {
      setIsRegistered(true)
    }
  }, [])

  useEffect(() => {
    const history = localStorage.getItem("search_history")
    if (history) {
      setSearchHistory(JSON.parse(history).slice(0, 4))
    }

    const fetchRecommended = async () => {
      try {
        const res = await fetch("/api/products?limit=6&sort=rating")
        if (res.ok) {
          const data = await res.json()
          setRecommendedProducts(data.products || [])
        }
    } catch (error) {
      // Error fetching recommended products
    }
    }
    fetchRecommended()
  }, [])

  useEffect(() => {
    const performLiveSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setLiveSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const params = new URLSearchParams()
        params.set("search", searchQuery.trim())
        params.set("limit", "8")

        const res = await fetch(`/api/products?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setLiveSearchResults(data.products || [])
        }
    } catch (error) {
      // Live search error
    } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performLiveSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const history = localStorage.getItem("search_history")
      const existingHistory = history ? JSON.parse(history) : []
      const newHistory = [searchQuery.trim(), ...existingHistory.filter((h: string) => h !== searchQuery.trim())].slice(
        0,
        10,
      )
      localStorage.setItem("search_history", JSON.stringify(newHistory))
      setSearchHistory(newHistory.slice(0, 4))

      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchFocused(false)
      setMobileSearchOpen(false)
    }
  }

  const clearSearchHistory = () => {
    localStorage.removeItem("search_history")
    setSearchHistory([])
  }

  const removeHistoryItem = (item: string) => {
    const newHistory = searchHistory.filter((h) => h !== item)
    localStorage.setItem("search_history", JSON.stringify(newHistory))
    setSearchHistory(newHistory)
  }

  const handleHistoryClick = (item: string) => {
    setSearchQuery(item)
    setSearchFocused(true)
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      {bannerText && (
        <div className="hidden md:block bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] text-white text-center py-2 px-4 text-sm font-medium">
          <span className="animate-pulse">✨</span> {bannerText} <span className="animate-pulse">✨</span>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4 px-3 md:px-4">
          {/* Logo */}
          <BrandLogo size="md" />

          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />
              <input
                type="text"
                placeholder={t("Mahsulot qidirish...", "Поиск товаров...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="h-11 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm focus:border-[#7C5C3E] focus:outline-none focus:ring-2 focus:ring-[#7C5C3E]/20"
              />

              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto z-50">
                  {searchQuery.trim().length >= 2 && (
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-sm mb-3">
                        {isSearching
                          ? t("Qidirilmoqda...", "Идёт поиск...")
                          : `${t("Topildi", "Найдено")}: ${liveSearchResults.length}`}
                      </h3>
                      {liveSearchResults.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {liveSearchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              className="block group"
                              onClick={() => setSearchFocused(false)}
                            >
                              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                                <Image
                                  src={product.image_url || "/placeholder.svg"}
                                  alt=""
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform"
                                />
                              </div>
                              <h4 className="text-xs font-medium line-clamp-2 group-hover:text-[#7C5C3E]">
                                {lang === "uz" ? product.name_uz : product.name_ru}
                              </h4>
                              <p className="text-sm font-bold text-[#7C5C3E]">
                                {formatPrice(product.price)} {t("so'm", "сум")}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {searchHistory.length > 0 && searchQuery.trim().length < 2 && (
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">{t("Oxirgi qidiruvlar", "Недавние поиски")}</h3>
                        <button
                          onClick={clearSearchHistory}
                          className="text-xs text-[#7C5C3E] hover:underline"
                          type="button"
                        >
                          {t("Tozalash", "Очистить")}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {searchHistory.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                            onMouseDown={() => handleHistoryClick(item)}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeHistoryItem(item)
                              }}
                              type="button"
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-[#7C5C3E] transition-colors">
              {t("Bosh sahifa", "Главная")}
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-[#7C5C3E] transition-colors">
              {t("Rasmlar", "Картины")}
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-1.5 text-sm font-medium hover:text-[#7C5C3E] transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart className={`h-4 w-4 ${cartPulse ? "animate-bounce" : ""}`} />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-[#7C5C3E]"
                  >
                    {cartCount}
                  </Badge>
                )}
              </div>
              {t("Savat", "Корзина")}
            </Link>
            <Link
              href="/favorites"
              className="flex items-center gap-1.5 text-sm font-medium hover:text-[#7C5C3E] transition-colors"
            >
              <Heart className="h-4 w-4" />
              {t("Sevimlilar", "Избранное")}
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-1.5 text-sm font-medium hover:text-[#7C5C3E] transition-colors"
            >
              <Package className="h-4 w-4" />
              {t("Buyurtmalarim", "Мои заказы")}
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile search button */}
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMobileSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>

            {!isRegistered ? (
              <Button
                size="sm"
                variant="outline"
                className="hidden md:flex gap-1.5 border-[#7C5C3E] text-[#7C5C3E] hover:bg-[#7C5C3E] hover:text-white bg-transparent text-xs"
                onClick={() => router.push("/auth/register")}
              >
                <User className="h-4 w-4" />
                {t("Kirish", "Войти")}
              </Button>
            ) : (
              <Link
                href="/profile"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#7C5C3E]/10 text-[#7C5C3E] text-sm font-medium hover:bg-[#7C5C3E]/20 transition-colors"
              >
                <User className="h-4 w-4" />
                {t("Profil", "Профиль")}
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              className="font-semibold bg-transparent h-8 w-8 md:h-9 md:w-auto md:px-3 p-0"
              onClick={() => setLang(lang === "uz" ? "ru" : "uz")}
            >
              {lang === "uz" ? "RU" : "UZ"}
            </Button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {mobileSearchOpen && (
          <div className="fixed inset-0 z-[100] bg-background md:hidden">
            <div className="flex items-center gap-2 p-3 border-b">
              <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("Mahsulot qidirish...", "Поиск товаров...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="h-10 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm focus:border-[#7C5C3E] focus:outline-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(100vh-60px)]">
              {searchQuery.trim().length >= 2 ? (
                <div>
                  <h3 className="font-semibold text-sm mb-3">
                    {isSearching
                      ? t("Qidirilmoqda...", "Идёт поиск...")
                      : `${liveSearchResults.length} ${t("ta natija", "результатов")}`}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {liveSearchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="block"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                          <Image src={product.image_url || "/placeholder.svg"} alt="" fill className="object-cover" />
                        </div>
                        <h4 className="text-xs font-medium line-clamp-2">
                          {lang === "uz" ? product.name_uz : product.name_ru}
                        </h4>
                        <p className="text-sm font-bold text-[#7C5C3E]">
                          {formatPrice(product.price)} {t("so'm", "сум")}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {searchHistory.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">{t("Oxirgi qidiruvlar", "Недавние поиски")}</h3>
                        <button onClick={clearSearchHistory} className="text-xs text-[#7C5C3E]" type="button">
                          {t("Tozalash", "Очистить")}
                        </button>
                      </div>
                      {searchHistory.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(item)
                            handleHistoryClick(item)
                          }}
                          className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-md text-left"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {recommendedProducts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3">{t("Tavsiya etamiz", "Рекомендуем")}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {recommendedProducts.slice(0, 4).map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            onClick={() => setMobileSearchOpen(false)}
                            className="block"
                          >
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                              <Image
                                src={product.image_url || "/placeholder.svg"}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                            <h4 className="text-xs font-medium line-clamp-2">
                              {lang === "uz" ? product.name_uz : product.name_ru}
                            </h4>
                            <p className="text-sm font-bold text-[#5200BB]">
                              {formatPrice(product.price)} {t("so'm", "сум")}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden pb-safe">
        <div className="grid grid-cols-5 h-14">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 ${isActive("/") ? "text-[#7C5C3E]" : "text-muted-foreground"}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t("Bosh", "Главная")}</span>
          </Link>
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center gap-0.5 ${isActive("/products") ? "text-[#7C5C3E]" : "text-muted-foreground"}`}
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t("Rasmlar", "Картины")}</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center justify-center gap-0.5 relative">
            <div className="relative">
              <ShoppingCart className={`h-5 w-5 ${isActive("/cart") ? "text-[#7C5C3E]" : "text-muted-foreground"}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#7C5C3E] text-[10px] text-white flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-medium ${isActive("/cart") ? "text-[#7C5C3E]" : "text-muted-foreground"}`}
            >
              {t("Savat", "Корзина")}
            </span>
          </Link>
          <Link
            href="/favorites"
            className={`flex flex-col items-center justify-center gap-0.5 ${isActive("/favorites") ? "text-[#7C5C3E]" : "text-muted-foreground"}`}
          >
            <Heart className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t("Sevimli", "Избран.")}</span>
          </Link>
          <Link
            href={isRegistered ? "/profile" : "/auth/register"}
            className={`flex flex-col items-center justify-center gap-0.5 ${isActive("/profile") || isActive("/auth/register") ? "text-[#7C5C3E]" : "text-muted-foreground"}`}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">
              {isRegistered ? t("Profil", "Профиль") : t("Kirish", "Войти")}
            </span>
          </Link>
        </div>
      </nav>
    </>
  )
}
