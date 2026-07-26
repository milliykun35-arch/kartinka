"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, Send, MapPin, Phone, Shield, Truck, Star, Sparkles, Award, Gift } from "lucide-react"
import type { StoreSettings } from "@/lib/types"

interface AboutSectionProps {
  settings: StoreSettings | null
}

export function AboutSection({ settings }: AboutSectionProps) {
  const { lang, t } = useLanguage()

  const about = lang === "uz" ? settings?.about_uz : settings?.about_ru
  const address = lang === "uz" ? settings?.address_uz : settings?.address_ru

  const features = [
    {
      icon: Gift,
      title: t("Premium sifat", "Премиум качество"),
      desc: t("Sifatli chop etish", "Высококачественная печать"),
      color: "from-amber-500 to-orange-400",
    },
    {
      icon: Shield,
      title: t("100% Sifat", "100% Качество"),
      desc: t("Kafolatlangan material", "Гарантированный материал"),
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Truck,
      title: t("Tezkor yetkazib berish", "Быстрая доставка"),
      desc: t("1-3 kun ichida", "В течение 1-3 дней"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Award,
      title: t("Keng tanlov", "Большой выбор"),
      desc: t("Nature, cars va boshqalar", "Nature, cars и другие"),
      color: "from-[#7C5C3E] to-[#A8845C]",
    },
  ]

  return (
    <section id="about" className="py-8 sm:py-16">
      <div className="mb-8 flex items-center gap-3 sm:mb-12">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5C3E] to-[#A8845C] shadow-lg shadow-[#7C5C3E]/30">
          <Star className="h-6 w-6 text-white animate-pulse" />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-yellow-300 animate-bounce" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground sm:text-3xl md:text-4xl bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] bg-clip-text text-transparent">
            {t("Biz haqimizda", "О нас")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("Kartinka — devoriy rasmlar galereyasi 🏦", "Kartinka — галерея настенных картин 🏦")}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:mb-12 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="group relative overflow-hidden border-0 bg-card shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7C5C3E]/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C5C3E]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative flex flex-col items-center p-6 text-center">
              <div
                className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#7C5C3E]/5 via-card to-amber-500/5 shadow-xl">
          <CardContent className="p-4 sm:p-8">
            <div className="mb-4 flex items-center gap-3 sm:mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C5C3E] sm:h-12 sm:w-12">
                <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground sm:text-xl">Kartinka</h3>
            </div>

            {about && <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">{about}</p>}

            {!about && (
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t(
                  "Kartinka — devoriy rasmlar galereyasi. Biz sizga tabiat manzaralari, avtomobillar va boshqa chiroyli art-print rasmlarni taqdim etamiz. Har bir rasm sifatli material va aniq chop etish bilan tayyorlanadi. Devorlaringizni go'zallashtiramiz!",
                  "Kartinka — галерея настенных картин. Мы предлагаем пейзажи, автомобили и другие арт-принты. Каждая картина изготовлена из качественных материалов с точной печатью!",
                )}
              </p>
            )}

            <div className="space-y-3 sm:space-y-4">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="group flex items-center gap-3 transition-colors hover:text-[#7C5C3E]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 transition-colors group-hover:bg-green-500/20">
                    <Phone className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="font-semibold text-foreground">{settings.phone}</span>
                </a>
              )}
              {address && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground sm:text-base">{address}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              {settings?.instagram_link && (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="group gap-2 border-pink-500/30 bg-pink-500/5 transition-all hover:border-pink-500 hover:bg-pink-500 hover:text-white"
                >
                  <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
                    Instagram
                  </a>
                </Button>
              )}
              {settings?.telegram_link && (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="group gap-2 border-blue-500/30 bg-blue-500/5 transition-all hover:border-blue-500 hover:bg-blue-500 hover:text-white"
                >
                  <a href={settings.telegram_link} target="_blank" rel="noopener noreferrer">
                    <Send className="h-5 w-5 transition-transform group-hover:scale-110" />
                    Telegram
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#7C5C3E] to-[#A8845C] shadow-xl">
          <CardContent className="flex h-full flex-col justify-center p-4 sm:p-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {[
                { value: "200+", label: t("Rasmlar", "Картин") },
                { value: "5K+", label: t("Mijozlar", "Клиентов") },
                { value: "99%", label: t("Mamnunlik", "Довольных") },
                { value: "24/7", label: t("Qo'llab-quvvatlash", "Поддержка") },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-1 text-2xl font-black text-white sm:mb-2 sm:text-4xl">{stat.value}</div>
                  <div className="text-xs text-white/80 sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
