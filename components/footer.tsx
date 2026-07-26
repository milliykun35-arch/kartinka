"use client"

import { useLanguage } from "@/lib/language-context"
import { BrandLogo } from "@/components/brand-logo"
import Link from "next/link"
import type { StoreSettings } from "@/lib/types"
import { MapPin, Phone, User, HelpCircle, Send, Instagram, ShieldCheck, Truck, Sparkles, Heart } from "lucide-react"

interface FooterProps {
  settings: StoreSettings | null
}

export function Footer({ settings }: FooterProps) {
  const { lang, t } = useLanguage()
  const address = lang === "uz" ? settings?.address_uz : settings?.address_ru
  const phone = settings?.phone || "+998 90 123 45 67"

  return (
    <footer className="relative overflow-hidden border-t-2 border-[#7C5C3E]/20 bg-gradient-to-b from-card to-muted/40 pt-8 pb-24 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 lg:px-16">
        {/* Main Grid: 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pb-8 border-b border-border/60">
          {/* Brand Info (Full width 2 cols on mobile) */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <BrandLogo size="lg" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(
                "Kartinka — Tabiat, avtomobillar va qo'l ishi art-print rasmlar. Devorga ilingan go'zallik.",
                "Kartinka — Арт-картины природы, авто и ручной работы. Красота на вашей стене.",
              )}
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://t.me/kartinka_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C5C3E]/10 text-[#7C5C3E] hover:bg-[#7C5C3E] hover:text-white transition-all shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C5C3E]/10 text-[#7C5C3E] hover:bg-[#7C5C3E] hover:text-white transition-all shadow-sm"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C5C3E]/10 text-[#7C5C3E] hover:bg-[#7C5C3E] hover:text-white transition-all shadow-sm"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links (Column 1 on mobile) */}
          <div className="col-span-1 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-black text-[#7C5C3E] uppercase tracking-wider">{t("Katalog", "Каталог")}</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors">
                  {t("Barcha rasmlar", "Все картины")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=tabiat" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors">
                  {t("Tabiat", "Природа")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=avto" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors">
                  {t("Avtomobillar", "Автомобили")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=hand_made" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors">
                  {t("Masla (Qo'l ishi)", "Ручная работа")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service (Column 2 on mobile) */}
          <div className="col-span-1 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-black text-[#7C5C3E] uppercase tracking-wider">{t("Xizmatlar", "Сервис")}</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors">
                  {t("Biz haqimizda", "О нас")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-[#7C5C3E]" />
                  {t("Yordam va FAQ", "Помощь и FAQ")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors">
                  {t("Shartlar", "Условия")}
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-muted-foreground hover:text-[#7C5C3E] font-medium transition-colors flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                  {t("Saralanganlar", "Избранное")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (Full width 2 cols on mobile) */}
          <div className="col-span-2 md:col-span-1 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-black text-[#7C5C3E] uppercase tracking-wider">{t("Bog'lanish", "Контакты")}</h4>
            <div className="space-y-2 text-xs">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-[#7C5C3E]/30 text-foreground font-bold hover:bg-[#7C5C3E] hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#7C5C3E] group-hover:text-white shrink-0" />
                  <span>{phone}</span>
                </div>
                <span className="text-[10px] text-[#7C5C3E] group-hover:text-white font-semibold">24/7</span>
              </a>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-[#7C5C3E] shrink-0" />
                <span className="text-xs truncate">{address || t("Toshkent shahri, O'zbekiston", "г. Ташкент, Узбекистан")}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t("Kafolatlangan Sifat va Yetkazish", "Гарантия качества и доставки")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-muted-foreground">
          <p className="font-medium text-[11px]">
            © {new Date().getFullYear()} <span className="font-bold text-[#7C5C3E]">Kartinka.uz</span>. {t("Barcha huquqlar himoyalangan", "Все права защищены")}.
          </p>
          <div className="flex items-center gap-1.5 font-bold text-foreground text-[10px]">
            <span>{t("To'lov:", "Оплата:")}</span>
            <span className="px-1.5 py-0.5 rounded bg-muted border">Click</span>
            <span className="px-1.5 py-0.5 rounded bg-muted border">Payme</span>
            <span className="px-1.5 py-0.5 rounded bg-muted border">Naqd</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
