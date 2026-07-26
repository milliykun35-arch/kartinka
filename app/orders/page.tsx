"use client"

import { useLanguage } from "@/lib/language-context"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Package, Truck, CheckCircle, Clock, ArrowLeft, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { StoreSettings } from "@/lib/types"

interface Order {
  id: string
  order_number: string
  product_name: string
  product_image: string
  quantity: number
  price: number
  total_amount: number
  status: string
  created_at: string
  customer_name: string
  customer_phone: string
}

const statusInfo = {
  pending: {
    uz: "Kutilmoqda",
    ru: "Ожидается",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  },
  confirmed: {
    uz: "Tasdiqlandi",
    ru: "Подтверждено",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50 dark:bg-green-950",
  },
  preparing: {
    uz: "Tayyorlanmoqda",
    ru: "Готовится",
    icon: Package,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950",
  },
  delivering: {
    uz: "Yetkazilmoqda",
    ru: "Доставляется",
    icon: Truck,
    color: "text-amber-700 bg-amber-50 dark:bg-amber-950",
  },
  completed: {
    uz: "Yetkazildi",
    ru: "Доставлено",
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  },
}

export default function OrdersPage() {
  const { t, language } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userPhone, setUserPhone] = useState("")
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("user_data")
    if (savedUser) {
      const userInfo = JSON.parse(savedUser)
      setUserPhone(userInfo.phone)
      fetchOrders(userInfo.phone)
    } else {
      setLoading(false)
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))

    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get("payment")

    if (paymentStatus === "success") {
      setShowPaymentSuccess(true)
      window.history.replaceState({}, "", window.location.pathname)
      setTimeout(() => setShowPaymentSuccess(false), 5000)
    }
  }, [])

  const fetchOrders = async (phone: string) => {
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(t("Buyurtmani bekor qilishni xohlaysizmi?", "Вы хотите отменить заказ?"))) {
      return
    }

    setCancellingOrderId(orderId)
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      if (res.ok) {
        alert(t("Buyurtma bekor qilindi", "Заказ отменен"))
        fetchOrders(userPhone)
      } else {
        const data = await res.json()
        alert(data.error || t("Xatolik yuz berdi", "Произошла ошибка"))
      }
    } catch (error) {
      console.error("Cancel order error:", error)
      alert(t("Xatolik yuz berdi", "Произошла ошибка"))
    } finally {
      setCancellingOrderId(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        t(
          "Bu buyurtmani ro'yxatdan butunlay o'chirib yubormoqchimisiz?",
          "Вы хотите полностью удалить этот заказ из списка?",
        ),
      )
    ) {
      return
    }

    setCancellingOrderId(orderId)
    try {
      const res = await fetch("/api/orders/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      if (res.ok) {
        alert(t("Buyurtma o'chirildi", "Заказ удален"))
        fetchOrders(userPhone)
      } else {
        const data = await res.json()
        alert(data.error || t("Xatolik yuz berdi", "Произошла ошибка"))
      }
    } catch (error) {
      console.error("Delete order error:", error)
      alert(t("Xatolik yuz berdi", "Произошла ошибка"))
    } finally {
      setCancellingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">{t("Yuklanmoqda...", "Загрузка...")}</div>
      </div>
    )
  }

  if (!userPhone) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h2 className="mt-4 text-xl font-semibold">{t("Mening buyurtmalarim", "Мои заказы")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("Buyurtma berganingizda ma'lumotlaringiz saqlanadi", "Ваши данные сохраняются при оформлении заказа")}
          </p>
          <Button asChild className="mt-6 bg-[#7C5C3E] hover:bg-[#5C3D1E]">
            <Link href="/products">{t("Rasmlarga o'tish", "Перейти к картинам")}</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {showPaymentSuccess && (
            <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-950 p-4 border-2 border-green-200 dark:border-green-800 animate-in slide-in-from-top">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 dark:text-green-100">
                    {t("To'lovingiz qabul qilindi!", "Ваш платеж принят!")}
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    {t(
                      "Buyurtmangiz muvaffaqiyatli to'landi. Yaqin orada sizga aloqaga chiqamiz.",
                      "Ваш заказ успешно оплачен. Мы скоро с вами свяжемся.",
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentSuccess(false)}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("Mening buyurtmalarim", "Мои заказы")}</h1>
              <p className="mt-2 text-muted-foreground">
                {t(`${orders.length} ta buyurtma`, `${orders.length} заказов`)}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Orqaga", "Назад")}
              </Link>
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
              <h2 className="mt-4 text-xl font-semibold">{t("Buyurtmalar yo'q", "Нет заказов")}</h2>
              <p className="mt-2 text-muted-foreground">{t("Hali buyurtma bermagansiz", "Вы еще не делали заказы")}</p>
              <Button asChild className="mt-6 bg-[#7C5C3E] hover:bg-[#5C3D1E]">
                <Link href="/products">{t("Rasmlarga o'tish", "Перейти к картинам")}</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusInfo[order.status as keyof typeof statusInfo] || statusInfo.pending
                const StatusIcon = status.icon
                const canCancel = order.status === "pending"

                return (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={order.product_image || "/placeholder.svg"}
                            alt={order.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{order.product_name}</h3>
                          <p className="text-sm text-muted-foreground">{order.order_number}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {t("Miqdor", "Количество")}: {order.quantity}
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#7C5C3E]">
                            {order.total_amount.toLocaleString()} {t("so'm", "сум")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${status.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{language === "uz" ? status.uz : status.ru}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString(language === "uz" ? "uz-UZ" : "ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {canCancel && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className="mt-2"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {cancellingOrderId === order.id
                              ? t("Bekor qilinmoqda...", "Отменяется...")
                              : t("Bekor qilish", "Отменить")}
                          </Button>
                        )}
                        {(order.status === "completed" || order.status === "cancelled") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className="mt-2 text-muted-foreground"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {cancellingOrderId === order.id
                              ? t("O'chirilmoqda...", "Удаляется...")
                              : t("Ro'yxatdan o'chirish", "Удалить из списка")}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>{t("Qabul qilindi", "Принято")}</span>
                        <span>{t("Tayyorlanmoqda", "Готовится")}</span>
                        <span>{t("Yetkazilmoqda", "Доставляется")}</span>
                        <span>{t("Topshirildi", "Доставлено")}</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] transition-all duration-500"
                          style={{
                            width:
                              order.status === "pending"
                                ? "25%"
                                : order.status === "confirmed"
                                  ? "25%"
                                  : order.status === "preparing"
                                    ? "50%"
                                    : order.status === "delivering"
                                      ? "75%"
                                      : "100%",
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  )
}
