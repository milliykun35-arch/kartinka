"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, PhoneCall, Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Badge } from "@/components/ui/badge"

interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderNumber: string
}

export function OrderSuccessModal({ isOpen, onClose, orderNumber }: OrderSuccessModalProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewOrders = () => {
    onClose()
    router.push("/orders")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-2 border-[#7C5C3E]/30 rounded-3xl bg-card shadow-2xl">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-[#7C5C3E] via-[#A8845C] to-[#5C3D1E] p-6 text-center text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
          
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl border border-white/30 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>

          <Badge className="bg-white/20 text-white border-white/30 mb-2 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
            <Sparkles className="h-3 w-3 mr-1 text-amber-300" />
            {t("Tabriklaymiz!", "Поздравляем!")}
          </Badge>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {t("Buyurtmangiz Qabul Qilindi!", "Ваш заказ принят!")}
          </h3>
          <p className="text-xs text-amber-100/90 mt-1 font-medium">
            {t("Rasm tayyorlanishi uchun operatormiz bog'lanadi", "Наш оператор свяжется с вами для уточнения")}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Order Number Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-[#7C5C3E]/30">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("Buyurtma ID kodi:", "ID заказа:")}
              </p>
              <p className="text-base font-black text-[#7C5C3E] font-mono">{orderNumber}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyOrderNumber}
              className="h-8 px-2.5 text-xs font-bold border-[#7C5C3E]/40 text-[#7C5C3E] rounded-xl hover:bg-[#7C5C3E] hover:text-white transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? t("Nusxalandi", "Скопировано") : t("Nusxalash", "Копировать")}
            </Button>
          </div>

          {/* Timeline steps */}
          <div className="space-y-2 py-1">
            <p className="text-xs font-bold text-foreground">{t("Buyurtma bosqichlari:", "Этапы выполнения:")}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-[#7C5C3E] text-white font-bold shadow-sm">
                <span>1. {t("Qabul qilindi", "Принят")}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/15 text-[#7C5C3E] font-bold border border-[#7C5C3E]/30">
                <span>2. {t("Qo'ng'iroq", "Звонок")}</span>
              </div>
              <div className="p-2 rounded-xl bg-muted text-muted-foreground font-bold border">
                <span>3. {t("Yetkazish", "Доставка")}</span>
              </div>
            </div>
          </div>

          {/* Operator Notice Card */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C5C3E]/15 text-[#7C5C3E] shrink-0 mt-0.5">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {t("Operatorimiz 5-10 daqiqa ichida bog'lanadi", "Оператор свяжется в течение 5-10 минут")}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                {t("Siz bilan telefon orqali yetkazib berish vaqtini va to'lov usulini tasdiqlaymiz.", "Уточним удобное время доставки и способ оплаты.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 justify-center">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("100% Xavfsiz xarid va Sifat kafolati", "100% Безопасность и Гарантия")}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button
              onClick={handleViewOrders}
              variant="outline"
              className="h-11 border-2 border-[#7C5C3E] text-[#7C5C3E] font-bold rounded-xl text-xs sm:text-sm hover:bg-[#7C5C3E] hover:text-white transition-all"
            >
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              {t("Buyurtmalarim", "Мои заказы")}
            </Button>
            <Button
              onClick={onClose}
              className="h-11 bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-[#7C5C3E]/20"
            >
              {t("Tushunarli", "Понятно")}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
