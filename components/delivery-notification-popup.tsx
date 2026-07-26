"use client"

import { useEffect, useState } from "react"
import { X, Package, MapPin, Phone } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DeliveredOrder {
  id: string
  order_number: string
  product_name: string
  product_image: string
  delivery_service: string
  pickup_location: string
  customer_phone: string
}

export function DeliveryNotificationPopup() {
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([])
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    checkDeliveredOrders()
  }, [])

  const checkDeliveredOrders = async () => {
    try {
      const phone = localStorage.getItem("user_phone")
      if (!phone) return

      const res = await fetch(`/api/orders/delivered-check?phone=${encodeURIComponent(phone)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.orders && data.orders.length > 0) {
          setDeliveredOrders(data.orders)
          setIsOpen(true)
        }
      }
    } catch (error) {
      // Error checking delivered orders
    }
  }

  const handleClose = async () => {
    if (deliveredOrders.length > 0) {
      const order = deliveredOrders[currentOrderIndex]
      try {
        await fetch("/api/orders/mark-pickup-shown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        })
      } catch (error) {
        // Error marking pickup shown
      }
    }

    if (currentOrderIndex < deliveredOrders.length - 1) {
      setCurrentOrderIndex(currentOrderIndex + 1)
    } else {
      setIsOpen(false)
    }
  }

  if (deliveredOrders.length === 0) return null

  const order = deliveredOrders[currentOrderIndex]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <Card className="border-0 shadow-none">
          {/* Header with close button */}
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold">Mahsulot yetib keldi!</h2>
            </div>
            <p className="text-white/90">Buyurtma №{order.order_number}</p>
          </div>

          {/* Product info */}
          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <img
                src={order.product_image || "/placeholder.svg?height=80&width=80"}
                alt={order.product_name}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-2">{order.product_name}</h3>
                <p className="text-sm text-green-600 font-medium mt-1">Olishingiz mumkin</p>
              </div>
            </div>

            {/* Delivery service */}
            {order.delivery_service && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Yetkazish xizmati</p>
                    <p className="text-blue-700 dark:text-blue-300 font-semibold">{order.delivery_service}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pickup location */}
            {order.pickup_location && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-green-900 dark:text-green-100">Topshirish punkti</p>
                    <p className="text-green-700 dark:text-green-300">{order.pickup_location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300">Aloqa raqami</p>
                  <a href={`tel:${order.customer_phone}`} className="text-[#5200BB] font-semibold hover:underline">
                    {order.customer_phone}
                  </a>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full bg-[#5200BB] hover:bg-[#4A00A8]" size="lg">
              Tushundim
            </Button>

            {deliveredOrders.length > 1 && (
              <p className="text-center text-sm text-gray-500">
                {currentOrderIndex + 1} / {deliveredOrders.length} buyurtma
              </p>
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
