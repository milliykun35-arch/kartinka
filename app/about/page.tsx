import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SnowEffect } from "@/components/snow-effect"
import { HolidayDecorations } from "@/components/holiday-decorations"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Instagram,
  Send,
  MapPin,
  Phone,
  Shield,
  Truck,
  Star,
  Sparkles,
  Award,
  Gift,
  Users,
  Clock,
  Heart,
} from "lucide-react"
import type { StoreSettings } from "@/lib/types"

export const dynamic = "force-dynamic"

async function getSettings(): Promise<StoreSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("store_settings").select("*").limit(1).single()
  return data
}

export default async function AboutPage() {
  const settings = await getSettings()

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {settings?.snow_effect_enabled && <SnowEffect />}
      {settings?.holiday_effects_enabled && <HolidayDecorations />}

      <Header settings={settings} />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8 md:px-12 lg:px-16">
        <AboutPageClient settings={settings} />
      </main>

      <Footer settings={settings} />
    </div>
  )
}

function AboutPageClient({ settings }: { settings: StoreSettings | null }) {
  const features = [
    {
      icon: Gift,
      title: "Yangi yil chegirmalari",
      titleRu: "Новогодние скидки",
      desc: "50% gacha chegirma",
      descRu: "Скидки до 50%",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "100% Kafolat",
      titleRu: "100% Гарантия",
      desc: "Original mahsulotlar",
      descRu: "Оригинальная продукция",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Truck,
      title: "Tezkor yetkazib berish",
      titleRu: "Быстрая доставка",
      desc: "1-3 kun ichida",
      descRu: "В течение 1-3 дней",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Award,
      title: "Premium sifat",
      titleRu: "Премиум качество",
      desc: "Eng yaxshi brendlar",
      descRu: "Лучшие бренды",
      color: "from-[#7C5C3E] to-[#A8845C]",
    },
    {
      icon: Users,
      title: "10K+ Mijozlar",
      titleRu: "10K+ Клиентов",
      desc: "Ishonch bildirgan",
      descRu: "Довольных клиентов",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Clock,
      title: "24/7 Qo'llab-quvvatlash",
      titleRu: "24/7 Поддержка",
      desc: "Har doim yordam beramiz",
      descRu: "Всегда поможем",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Heart,
      title: "Mijoz mamnuniyati",
      titleRu: "Удовлетворение клиентов",
      desc: "99% ijobiy fikrlar",
      descRu: "99% положительных отзывов",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Star,
      title: "Eng yaxshi narxlar",
      titleRu: "Лучшие цены",
      desc: "Arzon va sifatli",
      descRu: "Дешево и качественно",
      color: "from-yellow-500 to-amber-500",
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <div className="mb-6 inline-flex items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5C3E] to-[#A8845C] shadow-2xl shadow-[#7C5C3E]/40">
            <Star className="h-8 w-8 text-white animate-pulse" />
            <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-300 animate-bounce" />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-black text-foreground sm:text-5xl md:text-6xl bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] bg-clip-text text-transparent">
          Kartinka haqida
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Tabiat, avtomobillar va sifatli art-print devoriy rasmlar galereyasi. Devorlaringizga go'zallik ulashamiz!
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#7C5C3E]/5 via-card to-amber-500/5 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C5C3E]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Kartinka</h2>
            </div>

            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                {settings?.about_uz ||
                  "Kartinka — devoriy rasmlar galereyasi. Biz sizga tabiat manzaralari, avtomobillar va boshqa chiroyli art-print rasmlarni taqdim etamiz."}
              </p>
              <p className="leading-relaxed">
                Bizning maqsadimiz - har bir uyni va ofisni go'zal devoriy rasmlar bilan boyitish. Har bir rasm sifatli material va aniq chop etish texnologiyasi bilan tayyorlanadi.
              </p>
              <p className="leading-relaxed">
                Kartinka bilan xarid qilish oson va qulay. Bizning jamoamiz sizga yordam berishga har doim tayyor!
              </p>
            </div>

            <div className="mt-8 space-y-4">
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
              {settings?.address_uz && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-muted-foreground">{settings.address_uz}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
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
          <CardContent className="flex h-full flex-col justify-center p-8">
            <h3 className="mb-8 text-center text-2xl font-bold text-white">Bizning yutuqlarimiz</h3>
            <div className="grid grid-cols-2 gap-8">
              {[
                { value: "10K+", label: "Mijozlar" },
                { value: "5K+", label: "Mahsulotlar" },
                { value: "99%", label: "Mamnunlik" },
                { value: "24/7", label: "Qo'llab-quvvatlash" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2 text-4xl font-black text-white">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
