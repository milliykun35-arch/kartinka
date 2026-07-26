"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import { sendTelegramOrderNotification } from "@/lib/telegram"
import { ShoppingCart, Trash2, Plus, Minus, Truck, Store, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { OrderSuccessModal } from "@/components/order-success-modal"
import { showAlert } from "@/components/ui/confirm-dialog"

interface CartItem {
  id: string
  name: string
  price: number
  own_store_price?: number
  image: string
  quantity: number
  source: "neox" | "uzum"
  color?: string | null
  stock: number
  maxStock?: number
}

export function CartClient() {
  const { t } = useLanguage()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({ name: "", phone: "" })
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successOrderNumber, setSuccessOrderNumber] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      const validCart = parsedCart.filter((item: CartItem) => item.id && item.name && item.price)
      if (validCart.length !== parsedCart.length) {
        localStorage.setItem("cart", JSON.stringify(validCart))
      }
      setCartItems(validCart)
    }

    const userData = localStorage.getItem("user_data")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setOrderForm({ name: parsedUser.name, phone: parsedUser.phone })
    }
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCartItems(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const removeItem = (id: string, source: "neox" | "uzum") => {
    updateCart(cartItems.filter((item) => !(item.id === id && item.source === source)))
  }

  const updateQuantity = (id: string, source: "neox" | "uzum", delta: number) => {
    updateCart(
      cartItems.map((item) => {
        if (item.id === id && item.source === source) {
          const newQuantity = item.quantity + delta
          const maxAllowed = item.maxStock || 999

          if (newQuantity > maxAllowed) {
            setTimeout(() => {
              showAlert(
                t("Diqqat", "Внимание"),
                t(
                  `Faqat ${maxAllowed} dona mavjud. Ko'proq qo'shib bo'lmaydi`,
                  `Доступно только ${maxAllowed} шт. Больше добавить нельзя`,
                ),
                "warning",
              )
            }, 100)
            return item
          }

          return { ...item, quantity: Math.max(1, Math.min(newQuantity, maxAllowed)) }
        }
        return item
      }),
    )
  }

  const totalPrice = cartItems.reduce((sum, item) => {
    const itemPrice = item.own_store_price ?? item.price ?? 0
    return sum + itemPrice * (item.quantity || 1)
  }, 0)

  // Free delivery if total >= 1 million OR pickup selected
  const deliveryFee = deliveryMethod === "pickup" || totalPrice >= 1000000 ? 0 : 50000
  const finalTotal = totalPrice + deliveryFee

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderForm.name.trim() || !orderForm.phone.trim()) {
      showAlert(
        t("Xatolik", "Ошибка"),
        t("Ism va telefon raqamni kiriting", "Введите имя и номер телефона"),
        "warning",
      )
      return
    }

    setSubmitting(true)

    try {
      const orderNumber = `ORD-${Date.now()}`

      const itemsForOrder = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.own_store_price || item.price,
        color: item.color || null,
        material: item.material || null,
        size: item.size || null,
        quantity: item.quantity,
        source: item.source,
      }))

      const orderPayload = {
        orderNumber,
        customerName: orderForm.name.trim(),
        customerPhone: orderForm.phone.trim(),
        paymentMethod: "call",
        deliveryMethod,
        deliveryFee,
        totalAmount: finalTotal,
        items: itemsForOrder,
        status: "pending",
      }

      let createdOrder = null
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        })
        if (response.ok) {
          createdOrder = await response.json()
        }
      } catch (apiErr) {
        console.warn("API order call failed, saving order locally:", apiErr)
      }

      const localOrder = createdOrder || {
        id: `ord-${Date.now()}`,
        order_number: orderNumber,
        customer_name: orderForm.name.trim(),
        customer_phone: orderForm.phone.trim(),
        total_amount: finalTotal,
        price: itemsForOrder[0]?.price || 0,
        quantity: itemsForOrder[0]?.quantity || 1,
        product_name: itemsForOrder[0]?.name || "Devoriy rasm",
        status: "pending",
        payment_method: "call",
        items: itemsForOrder,
        created_at: new Date().toISOString(),
      }

      sendTelegramOrderNotification({
        orderNumber,
        customerName: orderForm.name.trim(),
        customerPhone: orderForm.phone.trim(),
        totalAmount: finalTotal,
        items: itemsForOrder,
      }).catch((err) => console.warn("Client telegram notify:", err))

      const savedOrders = JSON.parse(localStorage.getItem("local_admin_orders") || "[]")
      savedOrders.unshift(localOrder)
      localStorage.setItem("local_admin_orders", JSON.stringify(savedOrders))

      const userOrders = JSON.parse(localStorage.getItem("local_user_orders") || "[]")
      userOrders.unshift(localOrder)
      localStorage.setItem("local_user_orders", JSON.stringify(userOrders))

      // Clear cart after successful order
      localStorage.removeItem("cart")
      setCartItems([])
      setShowOrderModal(false)
      setSuccessOrderNumber(orderNumber)
      setShowSuccessModal(true)
    } catch (err) {
      showAlert(
        t("Xatolik", "Ошибка"),
        t("Buyurtma yaratishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.", "Произошла ошибка при создании заказа. Попробуйте ещё раз."),
        "warning",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("Savat", "Корзина")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t(`${cartItems.length} ta mahsulot`, `${cartItems.length} товаров`)}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h2 className="mt-4 text-xl font-semibold">{t("Savat bo'sh", "Корзина пуста")}</h2>
          <p className="mt-2 text-muted-foreground">{t("Rasmlar qo'shing", "Добавьте картины в корзину")}</p>
          <Button asChild className="mt-6 bg-[#7C5C3E] hover:bg-[#5C3D1E]">
            <Link href="/products">{t("Rasmlarga o'tish", "Перейти к картинам")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => {
              const itemPrice = item.own_store_price ?? item.price ?? 0
              return (
                <Card key={`${item.id}-${item.source}`} className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.material && (
                              <span className="rounded-md bg-[#7C5C3E]/10 border border-[#7C5C3E]/30 px-2 py-0.5 text-[11px] font-bold text-[#7C5C3E]">
                                {item.material}
                              </span>
                            )}
                            {item.size && (
                              <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id, item.source)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.source, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.source, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-lg font-bold text-[#7C5C3E]">
                          {itemPrice.toLocaleString()} {t("so'm", "сум")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20 p-6 border-2 border-[#7C5C3E]/20">
              <h2 className="text-xl font-bold text-[#7C5C3E] mb-4">{t("Yetkazib berish", "Доставка")}</h2>

              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => setDeliveryMethod(value as "delivery" | "pickup")}
                className="space-y-3 mb-6"
              >
                <div className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-[#7C5C3E] transition-colors">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex flex-1 items-center gap-3 cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C5C3E]/10">
                      <Truck className="h-5 w-5 text-[#7C5C3E]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{t("Manzilga yetkazib berish", "Доставка на адрес")}</p>
                      <p className="text-sm text-muted-foreground">50,000 {t("so'm", "сум")}</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-[#7C5C3E] transition-colors">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex flex-1 items-center gap-3 cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <Store className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{t("O'zim olib ketaman", "Самовывоз")}</p>
                      <p className="text-sm text-green-600">{t("Bepul", "Бесплатно")}</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <h2 className="text-xl font-bold text-[#7C5C3E]">{t("Jami", "Итого")}</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Rasmlar", "Картины")}</span>
                  <span className="font-semibold">
                    {totalPrice.toLocaleString()} {t("so'm", "сум")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Yetkazib berish", "Доставка")}</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                    {deliveryFee === 0
                      ? t("Bepul", "Бесплатно")
                      : `${deliveryFee.toLocaleString()} ${t("so'm", "сум")}`}
                  </span>
                </div>
                {deliveryMethod === "delivery" && totalPrice < 1000000 && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-sm">
                    <p className="text-amber-700 dark:text-amber-300">
                      {t(
                        `Yana ${(1000000 - totalPrice).toLocaleString()} so'm qo'shing - bepul yetkazib berish!`,
                        `Добавьте еще ${(1000000 - totalPrice).toLocaleString()} сум для бесплатной доставки!`,
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div className="my-4 border-t-2 border-[#7C5C3E]/20" />
              <div className="flex justify-between text-xl font-bold text-[#7C5C3E]">
                <span>{t("Jami", "Итого")}</span>
                <span>
                  {finalTotal.toLocaleString()} {t("so'm", "сум")}
                </span>
              </div>

              <div className="mt-6">
                <Button
                  className="w-full h-14 bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setShowOrderModal(true)}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {t("Buyurtma berish", "Оформить заказ")}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  {t("Buyurtmangizni qabul qilamiz va siz bilan bog'lanamiz", "Мы примем ваш заказ и свяжемся с вами")}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowOrderModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C5C3E]/10">
                <Phone className="h-5 w-5 text-[#7C5C3E]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("Buyurtma berish", "Оформить заказ")}
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t(
                "Ma'lumotlaringizni qoldiring, tez orada siz bilan bog'lanamiz",
                "Оставьте данные, мы скоро свяжемся с вами",
              )}
            </p>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  {t("Ismingiz", "Ваше имя")}
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-[#7C5C3E] focus:outline-none focus:ring-2 focus:ring-[#7C5C3E]/20 transition-all"
                  placeholder={t("Ism va Familya", "Имя и Фамилия")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  {t("Telefon raqam", "Номер телефона")}
                </label>
                <input
                  type="tel"
                  required
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-[#7C5C3E] focus:outline-none focus:ring-2 focus:ring-[#7C5C3E]/20 transition-all"
                  placeholder="+998 XX XXX XX XX"
                />
              </div>

              {/* Order summary */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
                <p className="text-sm font-semibold text-[#7C5C3E]">{t("Buyurtma qiymati:", "Сумма заказа:")}</p>
                <p className="text-lg font-bold text-[#7C5C3E]">
                  {finalTotal.toLocaleString()} {t("so'm", "сум")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deliveryMethod === "pickup"
                    ? t("O'zim olib ketaman (bepul)", "Самовывоз (бесплатно)")
                    : t("Yetkazib berish bilan", "С доставкой")}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white font-bold h-11"
                >
                  {submitting ? t("Yuborilmoqda...", "Отправка...") : t("Buyurtma berish", "Заказать")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOrderModal(false)}
                  className="bg-transparent"
                >
                  {t("Bekor qilish", "Отмена")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            window.location.href = "/"
          }}
          orderNumber={successOrderNumber}
        />
      )}
    </div>
  )
}
