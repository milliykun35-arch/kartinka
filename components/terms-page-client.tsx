"use client"

import { useLanguage } from "@/lib/language-context"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Shield, CreditCard, Package, RefreshCw, AlertCircle } from "lucide-react"

export function TermsPageClient() {
  const { t } = useLanguage()

  const sections = [
    {
      icon: FileText,
      title: t("1. Umumiy qoidalar", "1. Общие положения"),
      content: t(
        "Kartinka onlayn do'konidan foydalanish orqali siz quyidagi shartlarni qabul qilasiz. Agar siz bu shartlar bilan rozi bo'lmasangiz, iltimos, saytdan foydalanmang. Biz shartlarni istalgan vaqtda o'zgartirish huquqini saqlab qolamiz.",
        "Используя интернет-магазин Kartinka, вы принимаете следующие условия. Если вы не согласны с этими условиями, пожалуйста, не используйте сайт. Мы оставляем за собой право изменять условия в любое время.",
      ),
    },
    {
      icon: Shield,
      title: t("2. Maxfiylik va Ma'lumotlar", "2. Конфиденциальность и Данные"),
      content: t(
        "Sizning shaxsiy ma'lumotlaringiz maxfiy saqlanadi va uchinchi shaxslarga berilmaydi. Biz faqat buyurtmangizni qayta ishlash uchun zarur bo'lgan ma'lumotlarni to'playmiz: ism, telefon raqam va yetkazib berish manzili. Ma'lumotlaringiz himoyalangan serverda saqlanadi.",
        "Ваши личные данные хранятся конфиденциально и не передаются третьим лицам. Мы собираем только необходимую информацию для обработки заказа: имя, номер телефона и адрес доставки. Ваши данные хранятся на защищенном сервере.",
      ),
    },
    {
      icon: CreditCard,
      title: t("3. To'lov va Narxlar", "3. Оплата и Цены"),
      content: t(
        "Barcha narxlar O'zbekiston so'mida ko'rsatilgan. Buyurtma berganingizdan so'ng admin siz bilan bog'lanadi va to'lov tafsilotlarini muhokama qiladi. Naqd pul yoki bank o'tkazmasi orqali to'lash mumkin.",
        "Все цены указаны в узбекских сумах. После оформления заказа менеджер свяжется с вами для уточнения деталей оплаты. Возможна оплата наличными или банковским переводом.",
      ),
    },
    {
      icon: Package,
      title: t("4. Yetkazib berish", "4. Доставка"),
      content: t(
        "Yetkazib berish Toshkent shahri bo'ylab 1-3 ish kuni ichida amalga oshiriladi. 1,000,000 so'mdan yuqori buyurtmalar uchun yetkazib berish bepul. Mahsulotni o'zingiz olib ketish ham mumkin - bu bepul. Yetkazib berish vaqti va narxi buyurtmada ko'rsatiladi.",
        "Доставка по городу Ташкент осуществляется в течение 1-3 рабочих дней. Бесплатная доставка для заказов свыше 1,000,000 сум. Также возможен самовывоз - это бесплатно. Время и стоимость доставки указываются в заказе.",
      ),
    },
    {
      icon: RefreshCw,
      title: t("5. Qaytarish va Almashtirish", "5. Возврат и Обмен"),
      content: t(
        "Siz mahsulotni olib qo'ygandan keyin 14 kun ichida qaytarish yoki almashtirish huquqiga egasiz. Mahsulot asl holatida, ishlatilmagan va to'liq qadoqlanishda bo'lishi kerak. Qaytarish uchun chegirma va kvitansiyani saqlab qoling. Pul 7 ish kuni ichida qaytariladi.",
        "Вы имеете право вернуть или обменять товар в течение 14 дней после получения. Товар должен быть в оригинальном состоянии, не использован и в полной упаковке. Сохраните чек и квитанцию для возврата. Деньги возвращаются в течение 7 рабочих дней.",
      ),
    },
    {
      icon: AlertCircle,
      title: t("6. Kafolat", "6. Гарантия"),
      content: t(
        "Barcha mahsulotlar rasmiy kafolat bilan ta'minlanadi. Kafolat muddati mahsulot tavsifida ko'rsatilgan. Kafolat faqat ishlab chiqaruvchi nuqsonlari uchun amal qiladi. Noto'g'ri foydalanish natijasida yuzaga kelgan shikastlar kafolatga kirmaydi.",
        "Все товары поставляются с официальной гарантией. Гарантийный срок указан в описании товара. Гарантия действует только на производственные дефекты. Повреждения в результате неправильной эксплуатации не покрываются гарантией.",
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7C5C3E]/10 mb-4">
            <FileText className="w-8 h-8 text-[#7C5C3E]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#7C5C3E] mb-3">
            {t("Foydalanish Shartlari", "Условия Использования")}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t(
              "Kartinka xizmatlaridan foydalanish shartlari va qoidalari",
              "Условия и правила использования услуг Kartinka",
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t("Oxirgi yangilanish: 2024 yil", "Последнее обновление: 2024 год")}
          </p>
        </div>

        {/* Content */}
        <Card className="border-2 border-[#7C5C3E]/20">
          <ScrollArea className="h-[600px] p-6 md:p-8">
            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#7C5C3E]/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#7C5C3E]" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">{section.title}</h2>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                    {index < sections.length - 1 && <Separator className="mt-6" />}
                  </div>
                )
              })}

              {/* Contact Info */}
              <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
                <h3 className="font-semibold text-foreground mb-2">
                  {t("Aloqa ma'lumotlari", "Контактная информация")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Agar savollaringiz bo'lsa, biz bilan bog'laning:",
                    "Если у вас есть вопросы, свяжитесь с нами:",
                  )}
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-[#7C5C3E] font-medium">Email: info@kartinka.uz</p>
                  <p className="text-[#7C5C3E] font-medium">
                    {t("Telefon: +998 90 123 45 67", "Телефон: +998 90 123 45 67")}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          {t(
            "Saytdan foydalanishni davom ettirib, siz ushbu shartlarni qabul qilasiz",
            "Продолжая использовать сайт, вы принимаете эти условия",
          )}
        </div>
      </div>
    </div>
  )
}
