"use client"

import { useLanguage } from "@/lib/language-context"
import { ProductCard } from "./product-card"
import type { Product } from "@/lib/types"
import { Sparkles, PackageSearch } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  searchQuery?: string
  viewMode?: "grid" | "list" // Added view mode support
}

export function ProductGrid({ products, searchQuery, viewMode = "grid" }: ProductGridProps) {
  const { t, lang } = useLanguage()

  const filteredProducts = searchQuery
    ? products.filter((product) => {
        const name = lang === "uz" ? product.name_uz : product.name_ru
        return name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : products

  if (filteredProducts.length === 0) {
    return (
      <section id="products" className="py-8 sm:py-12 md:py-16">
        <div className="mb-8 flex items-center gap-3 sm:mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C5C3E] shadow-lg shadow-[#7C5C3E]/30 sm:h-14 sm:w-14">
            <Sparkles className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground sm:text-3xl md:text-4xl">
              {t("Rasmlar", "Картины")}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("Eng mashhur devoriy rasmlar", "Самые популярные настенные картины")}
            </p>
          </div>
        </div>

        <div className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#7C5C3E]/10">
            <PackageSearch className="h-14 w-14 text-[#7C5C3E]" />
          </div>
          <p className="text-xl font-semibold text-foreground">
            {searchQuery
              ? t(`"${searchQuery}" bo'yicha rasm topilmadi`, `По запросу "${searchQuery}" ничего не найдено`)
              : t("Rasmlar topilmadi", "Картины не найдены")}
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            {searchQuery
              ? t("Boshqa so'z bilan qidirib ko'ring", "Попробуйте другой запрос")
              : t("Tez orada yangi mahsulotlar qo'shiladi", "Скоро добавим новые товары")}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="products" className="py-4 sm:py-8 md:py-12 lg:py-16">
      <div className="mb-4 sm:mb-8 md:mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-[#7C5C3E] shadow-lg shadow-[#7C5C3E]/30">
            <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-3xl md:text-4xl font-black text-foreground">
              {searchQuery
                ? t("Qidiruv natijalari", "Результаты поиска")
                : t("Rasmlar gallereyasi", "Галерея картин")}
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground">
              {searchQuery
                ? t(`${filteredProducts.length} ta rasm topildi`, `Найдено ${filteredProducts.length} картин`)
                : t("Devorga ilish uchun eng yaxshi rasmlar", "Лучшие картины для стен")}
            </p>
          </div>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-stretch gap-3 sm:gap-6 lg:gap-8"
            : "flex flex-col gap-4 sm:gap-6"
        }
      >
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 75}ms`, animationFillMode: "both" }}
          >
            <ProductCard product={product} index={index} viewMode={viewMode} />
          </div>
        ))}
      </div>
    </section>
  )
}
