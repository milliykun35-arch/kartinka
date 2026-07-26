"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Phone, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderNumber: string
}

export function OrderSuccessModal({ isOpen, onClose, orderNumber }: OrderSuccessModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        router.push("/help")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, router])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="rounded-full bg-green-100 p-3 animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center">Buyurtma qabul qilindi!</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg border border-[#5200BB]/30">
            <p className="text-sm text-muted-foreground text-center mb-2">Buyurtma raqami</p>
            <p className="text-lg font-semibold text-[#5200BB] text-center break-all">{orderNumber}</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <Phone className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 mb-1.5 text-sm">Iltimos, operator javobini kuting</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Operatorlarimiz 5-10 daqiqa ichida siz bilan bog'lanib, buyurtmani tasdiqlaydi va to'lov usulini
                kelishib oladi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 leading-relaxed">
              <span className="font-semibold">Ogoh bo'ling!</span> Biz faqat Yordam sahifasida ko'rsatilgan raqamlardan
              qo'ng'iroq qilamiz.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            3 soniyada Yordam sahifasiga yo'naltirilasiz...
          </div>

          <Button onClick={onClose} className="w-full bg-[#5200BB] hover:bg-[#4400A0]">
            Tushunarli
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
