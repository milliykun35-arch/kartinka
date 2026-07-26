"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createBrowserClient } from "@/lib/supabase/client"
import type { Order } from "@/lib/types"
import { XCircle, Package, Clock, CheckCircle, MapPin, Phone, Copy, ExternalLink, Truck, Trash2, CreditCard } from "lucide-react"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  awaiting_payment: { label: "To'lov kutilmoqda", color: "bg-amber-500", icon: CreditCard },
  pending: { label: "Qabul qilindi", color: "bg-blue-500", icon: Clock },
  confirmed: { label: "Tasdiqlandi", color: "bg-indigo-500", icon: CheckCircle },
  preparing: { label: "Tayyorlanmoqda", color: "bg-[#7C5C3E]", icon: Package },
  delivering: { label: "Yetkazilmoqda", color: "bg-orange-500", icon: Truck },
  completed: { label: "Yetkazildi", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Bekor qilindi", color: "bg-red-500", icon: XCircle },
  // Filter-only statuses
  all: { label: "Barchasi", color: "bg-gray-500", icon: Package },
  active: { label: "Faol", color: "bg-emerald-500", icon: Clock },
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [deliveryService, setDeliveryService] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("all")
  const { confirm } = useConfirmDialog()

  useEffect(() => {
    fetchOrders()

    const supabase = createBrowserClient()

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events: INSERT, UPDATE, DELETE
          schema: "public",
          table: "orders",
        },
        (payload) => {
          fetchOrders() // Refresh orders on any change
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, []) // Removed activeTab dependency - listen always

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      const dbOrders = Array.isArray(data) ? data : []
      const localOrders = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("local_admin_orders") || "[]") : []
      const merged = [...localOrders, ...dbOrders.filter((o: any) => !localOrders.some((lo: any) => lo.id === o.id))]
      setOrders(merged)
    } catch (error) {
      const localOrders = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("local_admin_orders") || "[]") : []
      setOrders(localOrders)
    }
    setLoading(false)
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      // 1. Update local orders state immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o)),
      )

      // 2. Update localStorage persistence
      if (typeof window !== "undefined") {
        const localAdminOrders = JSON.parse(localStorage.getItem("local_admin_orders") || "[]")
        const updatedAdmin = localAdminOrders.map((o: any) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
        localStorage.setItem("local_admin_orders", JSON.stringify(updatedAdmin))

        const localUserOrders = JSON.parse(localStorage.getItem("local_user_orders") || "[]")
        const updatedUser = localUserOrders.map((o: any) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
        localStorage.setItem("local_user_orders", JSON.stringify(updatedUser))
      }

      // 3. Background API sync
      fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
          note: statusNote,
          delivery_service: newStatus === "completed" ? deliveryService : null,
          pickup_location: newStatus === "completed" ? pickupLocation : null,
        }),
      }).catch((err) => console.warn("Order status patch fallback:", err))

      setSelectedOrder(null)
      setNewStatus("")
      setStatusNote("")
      setDeliveryService("")
      setPickupLocation("")
      alert("Buyurtma statusi muvaffaqiyatli yangilandi!")
    } catch (error) {
      console.error("Failed to update order status:", error)
      alert("Xatolik yuz berdi")
    }
  }

  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: "Barcha eski buyurtmalarni o'chirish",
      description:
        "Bekor qilingan va yetkazilgan barcha buyurtmalar butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi!",
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
    })

    if (!confirmed) return

    try {
      const res = await fetch("/api/orders/bulk-delete", {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete orders")

      const data = await res.json()
      alert(data.message || "Barcha eski buyurtmalar o'chirildi")
      fetchOrders()
    } catch (error) {
      console.error("[v0] Bulk delete error:", error)
      alert("Xatolik yuz berdi")
    }
  }

  const handleDeleteOrder = async (order: Order) => {
    // Only confirm once, briefly
    if (!window.confirm(`Buyurtmani o'chirish: ${order.customer_name}?`)) return

    try {
      const res = await fetch(`/api/orders/delete?orderId=${order.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchOrders()
        alert("Buyurtma o'chirildi!")
      } else {
        const data = await res.json()
        alert(data.error || "Xatolik yuz berdi")
      }
    } catch (error) {
      console.error("[v0] Order delete error:", error)
      alert("Xatolik yuz berdi")
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return !["completed", "cancelled"].includes(order.status)
    return order.status === activeTab
  })

  const orderCounts = {
    all: orders.length,
    active: orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} nusxa ko'chirildi!`)
    } catch (error) {
      console.error("[v0] Failed to copy:", error)
      alert("Nusxa ko'chirishda xatolik")
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl">Buyurtmalar boshqaruvi</CardTitle>
              <CardDescription className="text-xs md:text-sm">Barcha buyurtmalarni ko'ring va boshqaring</CardDescription>
            </div>
            <Button onClick={handleBulkDelete} variant="destructive" size="sm" className="gap-2 self-start sm:self-auto">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Eski buyurtmalarni o'chirish</span>
              <span className="sm:hidden">O'chirish</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 mb-4">
            {Object.entries(orderCounts).map(([key, count]) => {
              const config = statusConfig[key as keyof typeof statusConfig] || statusConfig.all
              const StatusIcon = config.icon
              const isActive = activeTab === key
              return (
                <Card 
                  key={key} 
                  className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-[#7C5C3E] bg-[#7C5C3E]/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setActiveTab(key)}
                >
                  <CardContent className="p-2 md:p-4">
                    <div className="flex items-center justify-between mb-1">
                      <StatusIcon className={`h-3 w-3 md:h-4 md:w-4 ${isActive ? 'text-[#7C5C3E]' : 'text-muted-foreground'}`} />
                      <span className={`text-lg md:text-2xl font-bold ${isActive ? 'text-[#7C5C3E]' : ''}`}>{count}</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{config.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Yuklanmoqda...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>Buyurtmalar topilmadi</p>
              <p className="text-xs mt-1">Yangi buyurtmalar bu yerda ko'rinadi</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || Package
                const statusColor = statusConfig[order.status]?.color || "bg-gray-500"
                const statusLabel = statusConfig[order.status]?.label || order.status
                const paymentStatus = (order as any).payment_status
                
                return (
                  <Card
                    key={order.id}
                    className={`overflow-hidden transition-all hover:shadow-lg ${
                      paymentStatus === "paid" ? "ring-2 ring-green-500 bg-green-50/50 dark:bg-green-950/20" :
                      order.status === "awaiting_payment" ? "ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20" :
                      order.status === "pending" ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    {/* Header - Status va Order Info */}
                    <div className={`px-4 py-2 ${statusColor} text-white flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <span className="font-semibold text-sm">{statusLabel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {(order as any).order_number && (
                          <span className="bg-white/20 px-2 py-0.5 rounded">#{(order as any).order_number}</span>
                        )}
                        <span className="opacity-80">{new Date(order.created_at).toLocaleString("uz-UZ")}</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      {/* To'lov holati badge */}
                      {paymentStatus && (
                        <div className="mb-3">
                          {paymentStatus === "paid" ? (
                            <Badge className="bg-green-600 text-white text-xs px-3 py-1">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              TO'LOV QILINDI
                            </Badge>
                          ) : paymentStatus === "awaiting" ? (
                            <Badge className="bg-amber-500 text-white text-xs px-3 py-1">
                              <Clock className="mr-1 h-3 w-3" />
                              TO'LOV KUTILMOQDA
                            </Badge>
                          ) : paymentStatus === "failed" ? (
                            <Badge className="bg-red-500 text-white text-xs px-3 py-1">
                              <XCircle className="mr-1 h-3 w-3" />
                              TO'LOV MUVAFFAQIYATSIZ
                            </Badge>
                          ) : null}
                        </div>
                      )}
                      
                      {/* Mahsulot nomi */}
                      <h3 className="font-bold text-lg mb-3 text-foreground">{order.product_name}</h3>
                      
                      {/* Asosiy ma'lumotlar - 2 ustunli grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Mijoz</p>
                          <p className="font-semibold">{order.customer_name}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Telefon</p>
                          <a href={`tel:${order.customer_phone}`} className="font-semibold text-[#7C5C3E] hover:underline flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customer_phone}
                          </a>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Miqdori</p>
                          <p className="font-bold text-lg">{order.quantity || 1} ta</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Narxi</p>
                          <p className="font-bold text-lg text-[#7C5C3E]">{((order.price || 0) * (order.quantity || 1)).toLocaleString()} so'm</p>
                        </div>
                      </div>
                      
                      {/* Material & Size */}
                      {(order.items?.[0]?.material || order.items?.[0]?.size) && (
                        <div className="flex flex-wrap gap-2 mb-3 bg-amber-500/10 rounded-lg p-2 border border-[#7C5C3E]/20">
                          {order.items[0].material && (
                            <span className="text-xs font-bold text-[#7C5C3E]">
                              Material: {order.items[0].material}
                            </span>
                          )}
                          {order.items[0].size && (
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                              O'lcham: {order.items[0].size}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Manzil */}
                      {order.customer_address && (
                        <div className="mb-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-blue-800 dark:text-blue-300">{order.customer_address}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <button
                                  onClick={() => copyToClipboard(order.customer_address!, "Manzil")}
                                  className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                                >
                                  <Copy className="h-3 w-3" />
                                  Nusxa
                                </button>
                                {order.latitude && order.longitude && (
                                  <>
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Google
                                    </a>
                                    <a
                                      href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=17&l=map`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Yandex
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* To'lov usuli */}
                      {order.payment_method && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <CreditCard className="h-4 w-4" />
                          <span>To'lov:</span>
                          <Badge variant="outline" className="capitalize">
                            {order.payment_method === "payme" && "PayMe"}
                            {order.payment_method === "click" && "Click"}
                            {order.payment_method === "call" && "Qo'ng'iroq"}
                            {!["payme", "click", "call"].includes(order.payment_method) && order.payment_method}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Action tugmalari */}
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setNewStatus(order.status)
                            setIsEditOpen(true)
                          }}
                          className="flex-1 border-[#7C5C3E] text-[#7C5C3E] hover:bg-[#7C5C3E] hover:text-white"
                        >
                          Boshqarish
                        </Button>
                        {(order.status === "cancelled" || order.status === "completed") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setSelectedOrder(null)
            setIsEditOpen(false)
          }}
        >
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Buyurtma statusini o'zgartirish</CardTitle>
              <CardDescription>{selectedOrder.product_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mijoz ma'lumotlari</label>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-2 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
                    <span className="font-mono text-xs text-blue-800 dark:text-blue-300">{selectedOrder.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.id, "Order ID")}
                      className="text-blue-600 hover:text-blue-800"
                      title="Order ID nusxa ko'chirish"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p>
                    <span className="font-medium">Ism:</span> {selectedOrder.customer_name}
                  </p>
                  <p>
                    <span className="font-medium">Telefon:</span>{" "}
                    <a href={`tel:${selectedOrder.customer_phone}`} className="text-[#7C5C3E]">
                      {selectedOrder.customer_phone}
                    </a>
                  </p>
                  {selectedOrder.customer_address && (
                    <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded space-y-2">
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-blue-800 dark:text-blue-300 break-words">
                          {selectedOrder.customer_address}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copyToClipboard(selectedOrder.customer_address!, "Manzil")}
                          className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1 text-xs"
                        >
                          <Copy className="h-3 w-3" />
                          Nusxa ko'chirish
                        </button>
                        {selectedOrder.latitude && selectedOrder.longitude && (
                          <>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.latitude},${selectedOrder.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Google Maps
                            </a>
                            <a
                              href={`https://yandex.uz/maps/?pt=${selectedOrder.longitude},${selectedOrder.latitude}&z=17&l=map`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Yandex Maps
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Miqdori:</span>
                    <Badge variant="secondary" className="text-base font-bold px-3">
                      {selectedOrder.quantity || 1} ta
                    </Badge>
                  </p>
                  {selectedOrder.color && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Rang:</span>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-600 shadow-md"
                          style={{
                            backgroundColor:
                              selectedOrder.color.toLowerCase() === "qora"
                                ? "#000000"
                                : selectedOrder.color.toLowerCase() === "oq"
                                  ? "#FFFFFF"
                                  : selectedOrder.color.toLowerCase() === "qizil"
                                    ? "#EF4444"
                                    : selectedOrder.color.toLowerCase() === "ko'k"
                                      ? "#3B82F6"
                                      : selectedOrder.color.toLowerCase() === "yashil"
                                        ? "#10B981"
                                        : selectedOrder.color.toLowerCase() === "sariq"
                                          ? "#F59E0B"
                                          : selectedOrder.color.toLowerCase() === "pushti"
                                            ? "#EC4899"
                                            : selectedOrder.color.toLowerCase() === "jigarrang"
                                              ? "#92400E"
                                              : selectedOrder.color.toLowerCase() === "kulrang"
                                                ? "#6B7280"
                                                : "#9CA3AF",
                          }}
                          title={selectedOrder.color}
                        />
                        <span className="text-sm font-medium capitalize">{selectedOrder.color}</span>
                      </div>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Narx (dona):</span> {selectedOrder.price.toLocaleString()} so'm
                  </p>
                  <p>
                    <span className="font-medium">Jami summa:</span>{" "}
                    <span className="font-bold text-[#7C5C3E] text-lg">
                      {((selectedOrder.price || 0) * (selectedOrder.quantity || 1)).toLocaleString()} so'm
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Buyurtma holati</label>
                {/* Visual progress steps */}
                <div className="flex items-center justify-between mb-4 bg-muted/50 rounded-xl p-3">
                  {selectedOrder && ["pending", "confirmed", "preparing", "delivering", "completed"].map((step, index) => {
                    const stepConfig = statusConfig[step]
                    const StepIcon = stepConfig?.icon || Package
                    const currentIndex = ["awaiting_payment", "pending", "confirmed", "preparing", "delivering", "completed"].indexOf(selectedOrder?.status || "")
                    const stepIndex = ["pending", "confirmed", "preparing", "delivering", "completed"].indexOf(step)
                    const isActive = stepIndex <= currentIndex - ((selectedOrder?.status === "awaiting_payment") ? 0 : 1)
                    const isCurrent = step === selectedOrder?.status
                    
                    return (
                      <div key={step} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCurrent ? `${stepConfig?.color} text-white ring-2 ring-offset-2 ring-current` :
                          isActive ? `${stepConfig?.color} text-white` : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        }`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <span className={`text-[10px] text-center max-w-[50px] ${isCurrent ? "font-bold" : "text-muted-foreground"}`}>
                          {stepConfig?.label}
                        </span>
                        {index < 4 && (
                          <div className={`absolute w-8 h-0.5 translate-x-10 ${isActive ? "bg-green-500" : "bg-gray-200"}`} style={{display: "none"}} />
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Only show actual order statuses, not filter options */}
                    {["awaiting_payment", "pending", "confirmed", "preparing", "delivering", "completed", "cancelled"].map((key) => {
                      const config = statusConfig[key]
                      if (!config) return null
                      const Icon = config.icon
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                            <Icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "completed" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-red-600">
                      Yetkazish xizmati <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={deliveryService}
                      onChange={(e) => setDeliveryService(e.target.value)}
                      placeholder="BIS Pochta, O'zbekiston Pochtasi, va h.k."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-red-600">
                      Topshirish punkti manzili <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Eng yaqin topshirish punktining to'liq manzili..."
                      rows={2}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Mijozga eng yaqin topshirish punkti manzilini kiriting</p>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Izoh (ixtiyoriy)</label>
                <Textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Statusni o'zgartirish sababi..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Bekor qilish
                </Button>
                {(selectedOrder.status === "cancelled" || selectedOrder.status === "completed") && (
                  <Button variant="destructive" onClick={() => handleDeleteOrder(selectedOrder)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    O'chirish
                  </Button>
                )}
                {!["cancelled", "completed"].includes(selectedOrder.status) && (
                  <Button onClick={handleStatusUpdate}>Saqlash</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export { OrdersManagement }
export default OrdersManagement
