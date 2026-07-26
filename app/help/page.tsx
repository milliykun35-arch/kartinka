"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Phone, MapPin, Clock, ArrowLeft, Mail, ShieldAlert, HelpCircle, MessageSquare, Truck, RefreshCw, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HelpPage() {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error(err))
  }, [])

  const phoneNumbers = settings?.phone_numbers || []
  const workingHours = lang === "uz" ? settings?.working_hours_uz : settings?.working_hours_ru

  const faqItems = [
    {
      q: t("Kartinalar qanday materialga bosiladi?", "На каком материале печатаются картины?"),
      a: t(
        "Barcha rasmlar yuqori sifatli kanvas va sifatli mato materiallarga professional ultrabinafsha (UV) va pigmentli bosma texnologiyasi orqali chop etiladi. Ranglar so'nmaydi va uzoq yillar davomida asl holatini saqlaydi.",
        "Все картины печатаются на высококачественном холсте и тканевых материалах с использованием профессиональной УФ и пигментной печати. Цвета не выцветают и сохраняют первозданный вид долгие годы.",
      ),
    },
    {
      q: t("Yetkazib berish vaqti va narxi qancha?", "Каковы сроки и стоимость доставки?"),
      a: t(
        "Toshkent shahri bo'ylab va viloyatlarga 1-3 ish kuni ichida yetkazib beramiz. 1 000 000 so'mdan yuqori buyurtmalar uchun yetkazib berish BEPUL! Shuningdek, o'zingiz olib ketishingiz (самовывоз) ham mumkin.",
        "Доставка по Ташкенту и областям осуществляется в течение 1-3 рабочих дней. При заказе от 1 000 000 сум доставка БЕСПЛАТНАЯ! Также доступен самовывоз.",
      ),
    },
    {
      q: t("Buyurtma uchun to'lov qanday amalga oshiriladi?", "Как происходит оплата заказа?"),
      a: t(
        "Avtomatik kartadan yechib olish talab qilinmaydi! Siz saytda ism va telefon raqamingizni qoldirib buyurtma berasiz. Operatorimiz siz bilan bog'lanib, to'lov usulini (naqd yoki karta orqali o'tkazma) va yetkazib berish manzilini aniqlashtiradi.",
        "Автоматическое списание с карты не требуется! Вы оставляете имя и номер телефона при оформлении заказа. Наш оператор свяжется с вами для уточнения удобного способа оплаты (наличными или переводом) и адреса.",
      ),
    },
    {
      q: t("Aramkasi (romi) bilan birga keladimi?", "Картина поставляется с рамой?"),
      a: t(
        "Ha, barcha devoriy rasmlarimiz yog'och podramnikka tortilgan va tayyor holda keladi. Siz uni darhol devorga ilishingiz mumkin.",
        "Да, все наши картины натянуты на деревянный подрамник и поставляются в готовом виде. Вы можете сразу повесить её на стену.",
      ),
    },
    {
      q: t("Maxsus rasm yoki o'zimning fotom bilan buyurtma bersam bo'ladimi?", "Можно ли заказать картину по своему фото?"),
      a: t(
        "Albatta! Operatorimiz bilan bog'lanib, o'zingiz xohlagan har qanday sifatli rasmni (oilaviy, tabiat, mashinalar va h.k.) yuborishingiz va buyurtma berishingiz mumkin.",
        "Конечно! Вы можете связаться с нашим оператором, отправить любое качественное фото (семейное, природа, авто и т.д.) и оформить индивидуальный заказ.",
      ),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header settings={settings} />

      <main className="flex-1">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#7C5C3E] via-[#A8845C] to-[#5C3D1E] py-14 px-4 sm:px-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <div className="container relative mx-auto max-w-5xl">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="mb-6 border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Bosh sahifa", "Главная")}
            </Button>

            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <HelpCircle className="h-4 w-4" />
                <span>Kartinka Support</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {t("Yordam Markazi", "Центр Помощи")}
              </h1>
              <p className="text-sm sm:text-lg text-white/90 leading-relaxed">
                {t(
                  "Savollaringiz bormi? Mijozlarni qo'llab-quvvatlash xizmatimiz har doim yordam berishga tayyor.",
                  "Есть вопросы? Наша служба поддержки всегда готова помочь вам.",
                )}
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
          {/* Safety Notice Banner */}
          <Card className="border-2 border-amber-500/30 bg-amber-500/10 shadow-md overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7C5C3E] text-white shadow-lg">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {t("Ogoh bo'ling va xavfsizlikni saqlang!", "Будьте внимательны!")}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(
                      "Biz faqat quyida ko'rsatilgan rasmiy telefon raqamlarimiz orqali qo'ng'iroq qilamiz. Noma'lum shaxslarga karta parollari yoki SMS kodlarini bermang!",
                      "Мы звоним только с указанных официальных номеров. Не передавайте никому пароли карт или SMS-коды!",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact & Info Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Direct Phone Call */}
            <Card className="md:col-span-2 border border-border shadow-md hover:border-[#7C5C3E]/40 transition-all">
              <CardHeader className="border-b bg-muted/40 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7C5C3E]/10 text-[#7C5C3E]">
                    <Phone className="h-5 w-5" />
                  </div>
                  {t("Rasmiy telefon raqamlarimiz", "Официальные телефоны")}
                </CardTitle>
                <CardDescription>
                  {t("Buyurtma berish yoki savollar uchun bevosita qo'ng'iroq qiling", "Звоните по любым вопросам")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {phoneNumbers.length > 0 ? (
                    phoneNumbers.map((phone: any, idx: number) => (
                      <a
                        key={idx}
                        href={`tel:${phone.number}`}
                        className="group flex flex-col justify-between p-4 rounded-xl border-2 border-border hover:border-[#7C5C3E] hover:bg-[#7C5C3E]/5 transition-all shadow-sm"
                      >
                        <span className="text-xs font-semibold text-muted-foreground mb-1">{phone.label}</span>
                        <span className="text-lg sm:text-xl font-bold text-[#7C5C3E] group-hover:scale-105 transition-transform">
                          {phone.number}
                        </span>
                      </a>
                    ))
                  ) : (
                    <a
                      href={`tel:${settings?.phone || "+998 90 123 45 67"}`}
                      className="flex flex-col justify-between p-4 rounded-xl border-2 border-[#7C5C3E]/30 bg-[#7C5C3E]/5 hover:border-[#7C5C3E] transition-all shadow-sm"
                    >
                      <span className="text-xs font-semibold text-muted-foreground mb-1">
                        {t("Mijozlar xizmati", "Служба клиентов")}
                      </span>
                      <span className="text-xl font-bold text-[#7C5C3E]">
                        {settings?.phone || "+998 90 123 45 67"}
                      </span>
                    </a>
                  )}
                </div>

                {settings?.email && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border">
                    <Mail className="h-5 w-5 text-[#7C5C3E]" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("Elektron pochta", "Email")}: </span>
                      <a href={`mailto:${settings.email}`} className="font-bold text-[#7C5C3E] hover:underline">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="border border-border shadow-md">
              <CardHeader className="border-b bg-muted/40 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  {t("Ish tartibi", "Режим работы")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {workingHours ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{workingHours}</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">{t("Dushanba - Shanba", "Пн - Сб")}</span>
                      <span className="font-bold text-[#7C5C3E]">09:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("Yakshanba", "Воскресенье")}</span>
                      <span className="font-bold text-green-600">{t("Dam olish kuni", "Выходной")}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* FAQ Accordion Section */}
          <Card className="border border-border shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <MessageSquare className="h-5 w-5 text-[#7C5C3E]" />
                {t("Ko'p beriladigan savollar (FAQ)", "Часто задаваемые вопросы")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full space-y-3">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-xl px-4 bg-card">
                    <AccordionTrigger className="text-base font-bold text-left hover:text-[#7C5C3E] py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 border-t pt-3">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  )
}
