"use client"

import { DialogDescription } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Heart,
  Bell,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Loader2,
  Store,
  MessageSquare,
  ImageIcon,
  Users,
  Sparkles,
  MapPin,
  CreditCard,
  Check,
  Phone,
  Upload,
} from "lucide-react"
import NextImage from "next/image"
import { createBrowserClient } from "@/lib/supabase/client"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createSlide,
  updateSlide,
  deleteSlide,
  updateSettings,
  updateProductRating,
} from "./actions"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { OrdersManagement } from "@/components/admin/orders-management"
import { ReviewsManagement } from "@/components/admin/reviews-management"
import type { Product, CarouselSlide, StoreSettings } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [authError, setAuthError] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [users, setUsers] = useState<any[]>([]) // Assuming users type is not defined yet
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [slideDialogOpen, setSlideDialogOpen] = useState(false)
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [editingRating, setEditingRating] = useState<Product | null>(null)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()

  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [orders, setOrders] = useState<any[]>([]) // Added orders state

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    topProducts: [] as any[],
  })

  const [slideImageUrl, setSlideImageUrl] = useState("")
  const [slideLink, setSlideLink] = useState("")
  const [slideSortOrder, setSlideSortOrder] = useState(0)
  const [uploadingSlideImg, setUploadingSlideImg] = useState(false)

  const supabase = createBrowserClient() // Use createBrowserClient for client-side

  async function fetchData() {
    // 1. Instant Paint from Local Cache (0ms response)
    const localProds = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("local_products") || "[]") : []
    const localOrders = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("local_admin_orders") || "[]") : []

    if (localProds.length > 0) setProducts(localProds)
    if (localOrders.length > 0) setOrders(localOrders)

    // Calculate initial stats from local data
    const initTotalRev = localOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
    const initPending = localOrders.filter((o: any) => o.status === "pending").length
    setStats((prev) => ({
      ...prev,
      totalOrders: localOrders.length,
      totalRevenue: initTotalRev,
      totalProducts: localProds.length,
      pendingOrders: initPending,
    }))

    setLoading(false)

    // 2. Background DB Sync with 1200ms timeout so Admin Panel NEVER hangs
    try {
      const fetchWithTimeout = async () => {
        return Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("carousel_slides").select("*").order("sort_order"),
          supabase.from("store_settings").select("*").maybeSingle(),
          supabase.from("users").select("*").order("created_at", { ascending: false }),
          supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(50),
          supabase.from("orders").select("*"),
        ])
      }

      const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 1200))
      const res: any = await Promise.race([fetchWithTimeout(), timeout])

      if (res && Array.isArray(res)) {
        const [productsRes, slidesRes, settingsRes, usersRes, notificationsRes, ordersRes] = res
        const dbProducts = productsRes?.data || []
        const mergedProducts = [...localProds, ...dbProducts.filter((p: any) => !localProds.some((lp: any) => lp.id === p.id))]

        const dbOrders = ordersRes?.data || []
        const mergedOrders = [...localOrders, ...dbOrders.filter((o: any) => !localOrders.some((lo: any) => lo.id === o.id))]

        setProducts(mergedProducts)
        setSlides(slidesRes?.data || [])
        if (settingsRes?.data) setSettings(settingsRes.data)
        setUsers(usersRes?.data || [])
        setOrders(mergedOrders)

        const notifs = notificationsRes?.data || []
        setNotifications(notifs)
        setUnreadCount(notifs.filter((n: any) => !n.is_read).length)

        const totalRevenue = mergedOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
        const pendingOrders = mergedOrders.filter((o: any) => o.status === "pending").length

        setStats({
          totalOrders: mergedOrders.length,
          totalRevenue,
          totalProducts: mergedProducts.length,
          totalUsers: usersRes?.data?.length || 0,
          pendingOrders,
          topProducts: [],
        })
      }
    } catch (error) {
      console.warn("Background admin sync skipped:", error)
    }
  }

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth")
    if (auth === "kartinka_admin_2025_secure") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Real-time subscription for orders and notifications
  useEffect(() => {
    if (!isAuthenticated) return // Only set up subscriptions if authenticated

    const ordersChannel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          fetchData()
        },
      )
      .subscribe()

    const notificationsChannel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          fetchData()
          toast({
            title: "Yangi xabar",
            description: payload.new.title,
          })
        },
      )
      .subscribe()

    return () => {
      ordersChannel.unsubscribe()
      notificationsChannel.unsubscribe()
    }
  }, [isAuthenticated, toast, supabase]) // Added dependencies

  const handleAccessCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Secret code: KARTINKA2025ADMIN
    const correctCode = "KARTINKA2025ADMIN"

    if (accessCode === correctCode) {
      sessionStorage.setItem("admin_auth", "kartinka_admin_2025_secure")
      setIsAuthenticated(true)
      setAuthError(false)
    } else {
      setAuthError(true)
      setAccessCode("")
    }
  }

  const markAsRead = async (notificationId: string) => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", notificationId)
    fetchData()
  }

  const markAllAsRead = async () => {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false)
    fetchData()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md shadow-2xl border-2">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#7C5C3E] to-[#A8845C] flex items-center justify-center mb-4 animate-pulse">
              <Store className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] bg-clip-text text-transparent">
              Admin Panel
            </CardTitle>
            <p className="text-muted-foreground text-sm">Kirish uchun maxfiy kodni kiriting</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessCodeSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-base font-semibold">
                  Maxfiy Kod
                </Label>
                <Input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value)
                    setAuthError(false)
                  }}
                  placeholder="Kodni kiriting..."
                  className={`h-12 text-lg ${authError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  autoFocus
                />
                {authError && (
                  <p className="text-sm text-red-500 font-medium animate-shake">
                    Noto'g'ri kod. Qaytadan urinib ko'ring.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:opacity-90 transition-opacity"
              >
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (saving) return // Prevent double submission
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.set("is_active", formData.get("is_active") ? "true" : "false")

  const colorVariants: { color: string; stock: number; price?: number; image_url?: string }[] = []
  const container = document.getElementById("color-variants")
  if (container) {
    const variantInputs = container.querySelectorAll('[data-variant-item]')
    variantInputs.forEach((inputRow) => {
      const colorInput = inputRow.querySelector('[data-variant-field="color"]') as HTMLInputElement
      const stockInput = inputRow.querySelector('[data-variant-field="stock"]') as HTMLInputElement
      const priceInput = inputRow.querySelector('[data-variant-field="price"]') as HTMLInputElement
      const imageInput = inputRow.querySelector('[data-variant-field="image"]') as HTMLInputElement
      
      if (colorInput && stockInput && colorInput.value && stockInput.value) {
        const variant: any = {
          color: colorInput.value.trim(),
          stock: Number.parseInt(stockInput.value, 10),
        }
        if (priceInput?.value) {
          variant.price = Number.parseFloat(priceInput.value)
        }
        if (imageInput?.value) {
          variant.image_url = imageInput.value.trim()
        }
        colorVariants.push(variant)
      }
    })
  }
  formData.set("color_variants", JSON.stringify(colorVariants))

    let result
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, formData)
    } else {
      result = await createProduct(formData)
    }

    if (result.success) {
      setProductDialogOpen(false)
      setEditingProduct(null)
      fetchData()
      toast({
        title: editingProduct ? "Mahsulot yangilandi" : "Mahsulot qo'shildi",
        description: "O'zgarishlar muvaffaqiyatli saqlandi",
      })
    } else {
      toast({
        title: "Xatolik",
        description: result.error,
        variant: "destructive",
      })
    }
    setSaving(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Rostdan ham ushbu rasmni o'chirmoqchimisiz?")) {
      const result = await deleteProduct(id)
      if (result.success) {
        const localProds = JSON.parse(localStorage.getItem("local_products") || "[]")
        const updatedLocal = localProds.filter((p: any) => p.id !== id && String(p.id) !== String(id))
        localStorage.setItem("local_products", JSON.stringify(updatedLocal))

        setProducts((prev) => prev.filter((p) => p.id !== id && String(p.id) !== String(id)))
        toast({ title: "Rasm o'chirildi" })
      } else {
        toast({ title: "Xatolik", description: result.error, variant: "destructive" })
      }
    }
  }

  const handleOpenAddSlide = () => {
    setEditingSlide(null)
    setSlideImageUrl("")
    setSlideLink("")
    setSlideSortOrder(0)
    setSlideDialogOpen(true)
  }

  const handleOpenEditSlide = (slide: any) => {
    setEditingSlide(slide)
    setSlideImageUrl(slide.image_url || "")
    setSlideLink(slide.link || "")
    setSlideSortOrder(slide.sort_order || 0)
    setSlideDialogOpen(true)
  }

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    if (!slideImageUrl.trim()) {
      alert("Iltimos, rasm yuklang yoki rasm havolasini kiriting!")
      return
    }

    setSaving(true)

    try {
      const sanitizedImage = cleanImageUrl(slideImageUrl.trim())
      const newSlide = {
        id: editingSlide ? editingSlide.id : `slide-${Date.now()}`,
        image_url: sanitizedImage,
        link: slideLink.trim(),
        sort_order: Number(slideSortOrder) || 0,
        is_active: true,
        created_at: new Date().toISOString(),
      }

      // 1. Instant local update (0ms delay)
      const localSlides = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("local_slides") || "[]") : []
      let updatedSlides = []
      if (editingSlide) {
        updatedSlides = localSlides.map((s: any) => (s.id === editingSlide.id ? newSlide : s))
        setSlides((prev) => prev.map((s) => (s.id === editingSlide.id ? newSlide : s)))
      } else {
        updatedSlides = [newSlide, ...localSlides]
        setSlides((prev) => [newSlide, ...prev])
      }
      localStorage.setItem("local_slides", JSON.stringify(updatedSlides))

      // 2. Non-blocking background sync
      const formData = new FormData()
      formData.set("image_url", sanitizedImage)
      formData.set("link", slideLink.trim())
      formData.set("sort_order", String(slideSortOrder))
      formData.set("is_active", "true")

      editingSlide ? updateSlide(editingSlide.id, formData).catch(() => {}) : createSlide(formData).catch(() => {})

      setSlideDialogOpen(false)
      setEditingSlide(null)
      toast({
        title: editingSlide ? "Karusel rasmi yangilandi" : "Karusel rasmi qo'shildi",
        description: "Bosh sahifa karuselida rasm joylashtirildi",
      })
    } catch (err) {
      console.error("Slide save error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlide = async (id: string) => {
    if (confirm("Rostdan ham ushbu karusel rasmini o'chirmoqchimisiz?")) {
      try {
        await deleteSlide(id)
      } catch (err) {}

      const localSlides = JSON.parse(localStorage.getItem("local_slides") || "[]")
      const updated = localSlides.filter((s: any) => s.id !== id && String(s.id) !== String(id))
      localStorage.setItem("local_slides", JSON.stringify(updated))

      setSlides((prev) => prev.filter((s) => s.id !== id && String(s.id) !== String(id)))
      toast({ title: "Karusel rasmi o'chirildi" })
    }
  }

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)

    if (settings?.phone_numbers) {
      formData.set("phone_numbers", JSON.stringify(settings.phone_numbers))
    } else {
      formData.set("phone_numbers", JSON.stringify([]))
    }

    if (settings?.latitude !== undefined && settings?.latitude !== null) {
      formData.set("latitude", settings.latitude.toString())
    }
    if (settings?.longitude !== undefined && settings?.longitude !== null) {
      formData.set("longitude", settings.longitude.toString())
    }

    const result = await updateSettings(formData)

    if (result.success) {
      await fetchData()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      toast({ title: "Sozlamalar saqlandi" })
    } else {
      toast({ title: "Xatolik", description: result.error, variant: "destructive" })
    }
    setSaving(false)
  }

  const handleSaveRating = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRating) return
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const adminRating = formData.get("admin_rating") ? Number.parseFloat(formData.get("admin_rating") as string) : null
    const minRating = Number.parseFloat(formData.get("min_rating") as string) || 4.4

    const result = await updateProductRating(editingRating.id, adminRating, minRating)
    if (result.success) {
      setRatingDialogOpen(false)
      setEditingRating(null)
      fetchData()
      toast({ title: "Reyting yangilandi" })
    } else {
      toast({ title: "Xatolik", description: result.error, variant: "destructive" })
    }
    setSaving(false)
  }

  // Statistics calculations
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.is_active).length
  const totalFavorites = products.reduce((sum, p) => sum + (p.favorites_count || 0), 0)
  const avgRating = products.length > 0 ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length : 0
  const totalUsers = users.length
  const todayUsers = users.filter((u) => {
    const today = new Date().toDateString()
    const userDate = new Date(u.created_at).toDateString()
    return today === userDate
  }).length

  // Calculate statistics at component level
  const totalProductsCount = products.length
  const activeProductsCount = products.filter((p) => p.is_active).length
  const totalFavoritesCount = products.reduce((sum, p) => sum + (p.favorites_count || 0), 0)
  const avgRatingValue =
    products.length > 0 ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length : 0
  const totalUsersCount = users.length
  const todayUsersCount = users.filter((u) => {
    const today = new Date().toDateString()
    const userDate = new Date(u.created_at).toDateString()
    return today === userDate
  }).length

  // Calculate product sales from fetched orders
  const productSales: { [key: string]: { name: string; count: number; revenue: number } } = {}
  orders.forEach((order: any) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.product_name,
            count: 0,
            revenue: 0,
          }
        }
        productSales[item.product_id].count += item.quantity || 1
        productSales[item.product_id].revenue += (item.price || 0) * (item.quantity || 1)
      })
    }
  })

  const topProductsList = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const statsMemo = {
    totalProducts: totalProductsCount,
    activeProducts: activeProductsCount,
    totalFavorites: totalFavoritesCount,
    avgRating: avgRatingValue,
    totalUsers: totalUsersCount,
    todayUsers: todayUsersCount,
    topProducts: topProductsList,
  }

  // Use fetched orders for OrdersManagement component
  const ordersData = orders

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[#7C5C3E]/5 p-2 sm:p-4 md:p-8">
      <div className="mb-4 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] bg-clip-text text-transparent">
            Kartinka Admin Panel
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Kartinka galereyasi boshqaruv paneli</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
          className="border-[#7C5C3E]/30 hover:bg-[#7C5C3E]/10 self-start sm:self-auto"
        >
          Saytga qaytish
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7C5C3E]" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 md:grid md:grid-cols-5 lg:grid-cols-9">
            <TabsTrigger value="dashboard" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px]">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Bosh</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px]">
              <Package className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Mahsulotlar</span>
              <span className="sm:hidden">Tovar</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px] relative">
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Buyurtmalar</span>
              <span className="sm:hidden">Buyurt</span>
              {stats.pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px]">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Mijozlar</span>
              <span className="sm:hidden">Mijoz</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px]">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Statistika</span>
              <span className="sm:hidden">Stat</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px]">
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Sharhlar</span>
              <span className="sm:hidden">Sharh</span>
            </TabsTrigger>
            <TabsTrigger value="carousel" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px]">
              <ImageIcon className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Karusel</span>
              <span className="sm:hidden">Slayd</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px]">
              <Store className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Sozlamalar</span>
              <span className="sm:hidden">Sozla</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 text-xs md:text-sm flex-1 min-w-[80px] relative">
              <Bell className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Xabarlar</span>
              <span className="sm:hidden">Xabar</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jami buyurtmalar</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{stats.pendingOrders} ta kutilmoqda</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jami daromad</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" /> {/* Changed icon */}
                </CardHeader>
                <CardContent>
                  {/* <div className="text-2xl font-bold">{(stats.totalRevenue / 1000).toFixed(0)}K so'm</div> */}
                  <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)} so'm</div>
                  <p className="text-xs text-muted-foreground">Barcha buyurtmalardan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mahsulotlar</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" /> {/* Changed icon */}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsMemo.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Jami mahsulotlar soni</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Foydalanuvchilar</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsMemo.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Ro'yxatdan o'tganlar</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Eng ko'p sotilgan mahsulotlar</CardTitle>
                <CardDescription>Top 5 mahsulotlar va ularning statistikasi</CardDescription>
              </CardHeader>
              <CardContent>
                {statsMemo.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Hali buyurtmalar yo'q</p>
                ) : (
                  <div className="space-y-4">
                    {statsMemo.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.count} ta sotildi</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* <p className="font-bold">{(product.revenue / 1000).toFixed(0)}K</p> */}
                          <p className="font-bold">{formatPrice(product.revenue)} so'm</p>
                          <p className="text-xs text-muted-foreground">daromad</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mahsulotlar</h2>
                <p className="text-sm text-gray-500">{products.length} ta mahsulot</p>
              </div>
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setProductDialogOpen(true)
                }}
                className="gap-2 bg-[#7C5C3E] text-white shadow-lg hover:bg-[#7C5C3E]/90"
              >
                <Plus className="h-4 w-4" />
                Yangi mahsulot
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden border-0 bg-white shadow-md transition-all duration-300 hover:shadow-xl ${!product.is_active ? "opacity-50" : ""}`}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: "1080/1440" }}>
                      <NextImage
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name_uz}
                        fill
                        className="object-cover"
                      />
                      {(product.badge || (product.discount_percentage && product.discount_percentage > 0)) && (
                        <Badge
                          className={`absolute left-2 top-2 shadow-md ${
                            product.discount_percentage && product.discount_percentage > 0
                              ? "bg-red-500"
                              : product.badge === "TOP"
                                ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                                : product.badge === "YANGI"
                                  ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                                  : product.badge === "100% ORIGINAL"
                                    ? "bg-gradient-to-br from-green-400 to-lime-500"
                                    : product.badge === "HIT SAVDO"
                                      ? "bg-gradient-to-br from-purple-500 to-fuchsia-600"
                                      : "bg-[#7C5C3E]"
                          }`}
                        >
                          {product.discount_percentage && product.discount_percentage > 0
                            ? `-${product.discount_percentage}%`
                            : product.badge}
                        </Badge>
                      )}
                      {!product.is_active && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Badge variant="secondary">Nofaol</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">{product.name_uz}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{(product.rating || 5).toFixed(1)}</span>
                        <Heart className="h-4 w-4 text-red-400 ml-2" />
                        <span className="text-sm text-gray-500">{product.favorites_count || 0}</span>
                      </div>
                      {/* <p className="mb-3 text-lg font-bold text-[#7C5C3E]">{formatPrice(product.price)} so'm</p> */}
                      <p className="mb-3 text-lg font-bold text-[#7C5C3E]">
                        {product.discount_percentage && product.discount_percentage > 0 ? (
                          <span className="flex items-center gap-2">
                            {formatPrice(product.price)}
                            <span className="line-through text-sm text-gray-500">
                              {formatPrice(product.old_price || product.price)}
                            </span>
                          </span>
                        ) : (
                          formatPrice(product.price)
                        )}
                        so'm
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 border-[#7C5C3E]/20 text-[#7C5C3E] hover:bg-[#7C5C3E]/10 bg-transparent"
                          onClick={() => {
                            setEditingProduct(product)
                            setProductDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                          Tahrirlash
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-[#7C5C3E]/20 bg-[#7C5C3E]/5 p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-[#7C5C3E]/30" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Mahsulotlar yo'q</h3>
                <p className="text-gray-500">Birinchi mahsulotingizni qo'shing</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrdersManagement orders={ordersData} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ro'yxatdan o'tgan foydalanuvchilar</h2>
                <p className="text-sm text-gray-500">
                  {statsMemo.totalUsers} ta foydalanuvchi, bugun {statsMemo.todayUsers} ta
                </p>
              </div>
            </div>

            {/* User Statistics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-[#7C5C3E] to-[#A8845C]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">Jami foydalanuvchilar</p>
                      <p className="text-3xl font-bold text-white">{statsMemo.totalUsers}</p>
                    </div>
                    <Users className="h-12 w-12 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">Bugun ro'yxatdan o'tganlar</p>
                      <p className="text-3xl font-bold text-white">{statsMemo.todayUsers}</p>
                    </div>
                    <Sparkles className="h-12 w-12 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">So'nggi 7 kun</p>
                      <p className="text-3xl font-bold text-white">
                        {
                          users.filter((u) => {
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return new Date(u.created_at) > weekAgo
                          }).length
                        }
                      </p>
                    </div>
                    <Heart className="h-12 w-12 text-white/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Barcha foydalanuvchilar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Hali ro'yxatdan o'tgan foydalanuvchilar yo'q</p>
                    </div>
                  ) : (
                    users.map((user, idx) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="w-8 text-center font-bold text-gray-400">#{idx + 1}</span>
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#7C5C3E]/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-[#7C5C3E]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {user.name_uz} {user.surname_uz}
                          </p>
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {user?.created_at && !isNaN(new Date(user.created_at).getTime())
                              ? new Date(user.created_at).toLocaleDateString("uz-UZ")
                              : "-"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {user?.created_at && !isNaN(new Date(user.created_at).getTime())
                              ? new Date(user.created_at).toLocaleTimeString("uz-UZ", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Mahsulotlar statistikasi</h2>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Sevimlilarda eng ko'p qo'shilgan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...(products || [])]
                    .sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0))
                    .slice(0, 10)
                    .map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <span className="w-6 text-center font-bold text-gray-400">#{idx + 1}</span>
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          <NextImage
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name_uz}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name_uz}</p>
                          <p className="text-sm text-gray-500">{formatPrice(product.price)} so'm</p>
                        </div>
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart className="h-4 w-4 fill-red-500" />
                          <span className="font-bold">{product.favorites_count || 0}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Eng yuqori reytingli mahsulotlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...(products || [])]
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 10)
                    .map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <span className="w-6 text-center font-bold text-gray-400">#{idx + 1}</span>
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          <NextImage
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name_uz}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name_uz}</p>
                          <p className="text-sm text-gray-500">{product.rating_count || 0} ta sharh</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span className="font-bold">{(product.rating || 5).toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <ReviewsManagement />
          </TabsContent>

          {/* Carousel Tab */}
          <TabsContent value="carousel" className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Carousel rasmlar</h2>
                <p className="text-sm text-gray-500">{slides.length} ta rasm (1350x450 px)</p>
              </div>
              <Button
                onClick={handleOpenAddSlide}
                className="gap-2 bg-[#7C5C3E] text-white shadow-lg hover:bg-[#7C5C3E]/90 font-bold"
              >
                <Plus className="h-4 w-4" />
                Yangi rasm
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {slides.map((slide) => (
                <Card
                  key={slide.id}
                  className={`overflow-hidden border-0 shadow-md ${!slide.is_active ? "opacity-50" : ""}`}
                >
                  <CardContent className="p-0">
                    <div className="relative bg-gray-100" style={{ aspectRatio: "1350/450" }}>
                      <NextImage src={slide.image_url} alt="Slide" fill className="object-cover" />
                      {!slide.is_active && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Badge variant="secondary">Nofaol</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-500">Tartib: {slide.sort_order}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#7C5C3E]/20 text-[#7C5C3E] hover:bg-[#7C5C3E]/10 bg-transparent"
                          onClick={() => handleOpenEditSlide(slide)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSlide(slide.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Do'kon sozlamalari</CardTitle>
                <CardDescription>Aloqa ma'lumotlari va karta raqamlarini boshqaring</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-4 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h3 className="font-semibold text-lg">Asosiy ma'lumotlar</h3>

                    <div className="space-y-2">
                      <Label htmlFor="store_name">Do'kon nomi *</Label>
                      <Input
                        id="store_name"
                        name="store_name"
                        required
                        defaultValue={settings?.store_name || "Kartinka"}
                        placeholder="Kartinka"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about_uz">Biz haqimizda (O'zbekcha)</Label>
                      <Textarea
                        id="about_uz"
                        name="about_uz"
                        rows={3}
                        placeholder="Bizning do'konimiz haqida ma'lumot..."
                        defaultValue={settings?.about_uz || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about_ru">O nas (Ruscha)</Label>
                      <Textarea
                        id="about_ru"
                        name="about_ru"
                        rows={3}
                        placeholder="Ð˜Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ñ Ð¾ Ð½Ð°ÑˆÐµÐ¼ Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ðµ..."
                        defaultValue={settings?.about_ru || ""}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="banner_text_uz">Banner matni (O'zbekcha)</Label>
                        <Input
                          id="banner_text_uz"
                          name="banner_text_uz"
                          placeholder="Yetkazib berish 30,000 so'm istaqlagan shaxarga."
                          defaultValue={settings?.banner_text_uz || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="banner_text_ru">Tekst bannera (Ruscha)</Label>
                        <Input
                          id="banner_text_ru"
                          name="banner_text_ru"
                          placeholder="Ð”Ð¾ÑÑ‚Ð°Ð²ÐºÐ° 30,000 ÑÑƒÐ¼ Ð² Ð»ÑŽÐ±Ð¾Ð¹ Ð³Ð¾Ñ€Ð¾Ð´."
                          defaultValue={settings?.banner_text_ru || ""}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Aloqa uchun asosiy telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={settings?.phone || "+998 90 123 45 67"}
                        placeholder="+998 XX XXX XX XX"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={settings?.email || "info@kartinka.uz"}
                        placeholder="info@kartinka.uz"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address_uz">Manzil (O'zbekcha)</Label>
                    <Input
                      id="address_uz"
                      name="address_uz"
                      defaultValue={settings?.address_uz || "Toshkent sh., Chilonzor tumani"}
                      placeholder="To'liq manzil..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_ru">Manzil (Ruscha)</Label>
                    <Input
                      id="address_ru"
                      name="address_ru"
                      defaultValue={settings?.address_ru || "Ð³. Ð¢Ð°ÑˆÐºÐµÐ½Ñ‚, Ð§Ð¸Ð»Ð°Ð½Ð·Ð°Ñ€ÑÐºÐ¸Ð¹ Ñ€Ð°Ð¹Ð¾Ð½"}
                      placeholder="ÐŸÐ¾Ð»Ð½Ñ‹Ð¹ Ð°Ð´Ñ€ÐµÑ..."
                    />
                  </div>

                  {/* Manzil va xarita lokatsiyasi */}
                  <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Manzil va xarita lokatsiyasi
                    </h3>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Kenglik (Latitude)</Label>
                        <Input
                          id="latitude"
                          name="latitude"
                          type="number"
                          step="0.00000001"
                          placeholder="41.311081"
                          defaultValue={settings?.latitude || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="longitude">Uzunlik (Longitude)</Label>
                        <Input
                          id="longitude"
                          name="longitude"
                          type="number"
                          step="0.00000001"
                          placeholder="69.240562"
                          defaultValue={settings?.longitude || ""}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                const latInput = document.getElementById("latitude") as HTMLInputElement
                                const lonInput = document.getElementById("longitude") as HTMLInputElement
                                if (latInput && lonInput) {
                                  latInput.value = position.coords.latitude.toString()
                                  lonInput.value = position.coords.longitude.toString()
                                  // Update settings state to reflect the new values immediately
                                  setSettings((prevSettings) => ({
                                    ...prevSettings,
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                  }))
                                }
                              },
                              (error) => {
                                console.error("[v0] Geolocation error:", error)
                                alert("Lokatsiyani aniqlab bo'lmadi. Iltimos, brauzer ruxsatini tekshiring.")
                              },
                            )
                          } else {
                            alert("Brauzeringiz geolocation'ni qo'llab-quvvatlamaydi.")
                          }
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Joriy lokatsiyani aniqlash
                      </Button>

                      {settings?.latitude && settings?.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${settings.latitude},${settings.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Google Maps'da ochish
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Phone Numbers - Simplified */}
                  <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Phone className="h-5 w-5 text-green-600" />
                        Telefon raqamlari
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentNumbers = settings?.phone_numbers || []
                          const newNumbers = [...currentNumbers, { number: "", label: "" }]
                          setSettings(
                            (prevSettings) => ({ ...prevSettings, phone_numbers: newNumbers }) as StoreSettings,
                          )
                        }}
                      >
                        + Raqam qo'shish
                      </Button>
                    </div>

                    <input type="hidden" name="phone_numbers" value={JSON.stringify(settings?.phone_numbers || [])} />

                    {(settings?.phone_numbers || []).map((phone: any, index: number) => (
                      <div
                        key={index}
                        className="flex gap-2 items-center p-3 border rounded-lg bg-white dark:bg-gray-900"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Nomi (Asosiy, Qo'shimcha)"
                            value={phone.label || ""}
                            onChange={(e) => {
                              const updated = [...(settings?.phone_numbers || [])]
                              updated[index] = { ...updated[index], label: e.target.value }
                              setSettings(
                                (prevSettings) => ({ ...prevSettings, phone_numbers: updated }) as StoreSettings,
                              )
                            }}
                          />
                          <Input
                            placeholder="+998 XX XXX XX XX"
                            value={phone.number || ""}
                            onChange={(e) => {
                              const updated = [...(settings?.phone_numbers || [])]
                              updated[index] = { ...updated[index], number: e.target.value }
                              setSettings(
                                (prevSettings) => ({ ...prevSettings, phone_numbers: updated }) as StoreSettings,
                              )
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updated = (settings?.phone_numbers || []).filter((_: any, i: number) => i !== index)
                            setSettings(
                              (prevSettings) => ({ ...prevSettings, phone_numbers: updated }) as StoreSettings,
                            )
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Card Numbers */}
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Karta raqamlari
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="card_uzcard">Uzcard</Label>
                        <Input
                          id="card_uzcard"
                          name="card_uzcard"
                          placeholder="8600 1234 5678 9012"
                          defaultValue={settings?.card_uzcard || ""}
                          maxLength={19}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="card_humo">Humo</Label>
                        <Input
                          id="card_humo"
                          name="card_humo"
                          placeholder="9860 1234 5678 9012"
                          defaultValue={settings?.card_humo || ""}
                          maxLength={19}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="card_visa">Visa/MasterCard</Label>
                        <Input
                          id="card_visa"
                          name="card_visa"
                          placeholder="4242 4242 4242 4242"
                          defaultValue={settings?.card_visa || ""}
                          maxLength={19}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="card_holder">Karta egasi</Label>
                        <Input
                          id="card_holder"
                          name="card_holder"
                          placeholder="ISM FAMILYA"
                          defaultValue={settings?.card_holder || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="font-semibold text-lg">Ijtimoiy tarmoqlar</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="instagram_link">Instagram</Label>
                        <Input
                          id="instagram_link"
                          name="instagram_link"
                          type="url"
                          placeholder="https://instagram.com/kartinka.uz"
                          defaultValue={settings?.instagram_link || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telegram_link">Telegram</Label>
                        <Input
                          id="telegram_link"
                          name="telegram_link"
                          type="url"
                          placeholder="https://t.me/kartinka_uz"
                          defaultValue={settings?.telegram_link || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook_link">Facebook</Label>
                        <Input
                          id="facebook_link"
                          name="facebook_link"
                          type="url"
                          placeholder="https://facebook.com/kartinka.uz"
                          defaultValue={settings?.facebook_link || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_number">WhatsApp raqam</Label>
                        <Input
                          id="whatsapp_number"
                          name="whatsapp_number"
                          placeholder="+998901234567"
                          defaultValue={settings?.whatsapp_number || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Ish vaqti</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="working_hours_uz">Ish vaqti (O'zbekcha)</Label>
                        <Textarea
                          id="working_hours_uz"
                          name="working_hours_uz"
                          rows={3}
                          placeholder="Dushanba-Juma: 09:00-19:00&#10;Shanba: 09:00-17:00&#10;Yakshanba: Dam olish"
                          defaultValue={settings?.working_hours_uz || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="working_hours_ru">Ish vaqti (Ruscha)</Label>
                        <Textarea
                          id="working_hours_ru"
                          name="working_hours_ru"
                          rows={3}
                          placeholder="ÐŸÐ½-ÐŸÑ‚: 09:00-19:00&#10;Ð¡Ð±: 09:00-17:00&#10;Ð’Ñ: Ð’Ñ‹Ñ…Ð¾Ð´Ð½Ð¾Ð¹"
                          defaultValue={settings?.working_hours_ru || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Section */}
                  <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-600" />
                      Foydalanish shartlari va Maxfiylik siyosati
                    </h3>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="terms_uz">Foydalanish shartlari (O'zbekcha)</Label>
                        <Textarea
                          id="terms_uz"
                          name="terms_uz"
                          rows={4}
                          placeholder="Saytdan foydalanish shartlari..."
                          defaultValue={settings?.terms_uz || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="terms_ru">Foydalanish shartlari (Ruscha)</Label>
                        <Textarea
                          id="terms_ru"
                          name="terms_ru"
                          rows={4}
                          placeholder="Ð£ÑÐ»Ð¾Ð²Ð¸Ñ Ð¸ÑÐ¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ð½Ð¸Ñ ÑÐ°Ð¹Ñ‚Ð°..."
                          defaultValue={settings?.terms_ru || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="privacy_uz">Maxfiylik siyosati (O'zbekcha)</Label>
                        <Textarea
                          id="privacy_uz"
                          name="privacy_uz"
                          rows={4}
                          placeholder="Shaxsiy ma'lumotlarni himoya qilish..."
                          defaultValue={settings?.privacy_uz || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="privacy_ru">Maxfiylik siyosati (Ruscha)</Label>
                        <Textarea
                          id="privacy_ru"
                          name="privacy_ru"
                          rows={4}
                          placeholder="ÐŸÐ¾Ð»Ð¸Ñ‚Ð¸ÐºÐ° ÐºÐ¾Ð½Ñ„Ð¸Ð´ÐµÐ½Ñ†Ð¸Ð°Ð»ÑŒÐ½Ð¾ÑÑ‚Ð¸..."
                          defaultValue={settings?.privacy_ru || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="return_policy_uz">Qaytarish siyosati (O'zbekcha)</Label>
                        <Textarea
                          id="return_policy_uz"
                          name="return_policy_uz"
                          rows={4}
                          placeholder="Mahsulotni qaytarish shartlari..."
                          defaultValue={settings?.return_policy_uz || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="return_policy_ru">Qaytarish siyosati (Ruscha)</Label>
                        <Textarea
                          id="return_policy_ru"
                          name="return_policy_ru"
                          rows={4}
                          placeholder="Ð£ÑÐ»Ð¾Ð²Ð¸Ñ Ð²Ð¾Ð·Ð²Ñ€Ð°Ñ‚Ð° Ñ‚Ð¾Ð²Ð°Ñ€Ð°..."
                          defaultValue={settings?.return_policy_ru || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="warranty_uz">Kafolat (O'zbekcha)</Label>
                        <Textarea
                          id="warranty_uz"
                          name="warranty_uz"
                          rows={4}
                          placeholder="Kafolat shartlari..."
                          defaultValue={settings?.warranty_uz || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="warranty_ru">Kafolat (Ruscha)</Label>
                        <Textarea
                          id="warranty_ru"
                          name="warranty_ru"
                          rows={4}
                          placeholder="Ð£ÑÐ»Ð¾Ð²Ð¸Ñ Ð³Ð°Ñ€Ð°Ð½Ñ‚Ð¸Ð¸..."
                          defaultValue={settings?.warranty_ru || ""}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    {saved && (
                      <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Saqlandi!
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="ml-auto bg-[#7C5C3E] hover:bg-[#7C5C3E]/90 min-w-32"
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Saqlash"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Xabarlar</CardTitle>
                    <CardDescription>Buyurtmalar va yangiliklar haqida bildirishnomalar</CardDescription>
                  </div>
                  {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} variant="outline" size="sm">
                      Barchasini o'qilgan deb belgilash
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#7C5C3E]" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Bell className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-4">Hozircha xabarlar yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          notif.is_read ? "bg-gray-50 dark:bg-gray-900" : "bg-blue-50 dark:bg-blue-950 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{notif.title}</h3>
                              {!notif.is_read && (
                                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                                  Yangi
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {new Date(notif.created_at).toLocaleString("uz-UZ", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <Button onClick={() => markAsRead(notif.id)} variant="ghost" size="sm">
                              O'qildi
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              formData.set("is_active", formData.get("is_active") ? "true" : "false")

              const result = editingProduct
                ? await updateProduct(editingProduct.id, formData)
                : await createProduct(formData)

              if (result.success) {
                if (result.product) {
                  const localProds = JSON.parse(localStorage.getItem("local_products") || "[]")
                  if (editingProduct) {
                    const idx = localProds.findIndex((p: any) => p.id === editingProduct.id)
                    if (idx >= 0) localProds[idx] = result.product
                    else localProds.unshift(result.product)
                  } else {
                    localProds.unshift(result.product)
                  }
                  localStorage.setItem("local_products", JSON.stringify(localProds))
                  
                  // Update state immediately
                  setProducts((prev) => {
                    if (editingProduct) {
                      return prev.map((p) => (p.id === editingProduct.id ? { ...p, ...result.product } : p))
                    }
                    return [result.product, ...prev]
                  })
                }

                setProductDialogOpen(false)
              } else {
                alert(result.error || "Xatolik yuz berdi")
              }
            }}
            className="space-y-6"
          >
            {/* Removed Category Field */}
            {/* <div className="space-y-2">
              <Label htmlFor="category_id">Kategoriya *</Label>
              <select
                id="category_id"
                name="category_id"
                required
                defaultValue={editingProduct?.category_id || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Kategoriya tanlang</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_uz}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={editingProduct?.is_active ?? true} value="true" />
              <Label htmlFor="is_active">Faol</Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name_uz">Rasm nomi (O'zbekcha) *</Label>
                <Input
                  id="name_uz"
                  name="name_uz"
                  required
                  defaultValue={editingProduct?.name_uz}
                  placeholder="Tog'lar va Tabiat manzarasi (Kanvas)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ru">Rasm nomi (Ruscha) *</Label>
                <Input
                  id="name_ru"
                  name="name_ru"
                  required
                  defaultValue={editingProduct?.name_ru}
                  placeholder="Картина Горы и Природа (Холст)"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description_uz">Tavsif (O'zbekcha)</Label>
                <Textarea
                  id="description_uz"
                  name="description_uz"
                  defaultValue={editingProduct?.description_uz || ""}
                  rows={3}
                  placeholder="Yuqori sifatli kanvas matosiga bosilgan devoriy rasm. Yog'och podramnikka tortilgan..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_ru">Tavsif (Ruscha)</Label>
                <Textarea
                  id="description_ru"
                  name="description_ru"
                  defaultValue={editingProduct?.description_ru || ""}
                  rows={3}
                  placeholder="Качественная картина на холсте. Натянута на деревянный подрамник..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Boshlang'ich Narx (so'm) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  required
                  defaultValue={editingProduct?.price}
                  placeholder="250000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="old_price">Eski narxi (so'm)</Label>
                <Input
                  id="old_price"
                  name="old_price"
                  type="number"
                  defaultValue={editingProduct?.old_price}
                  placeholder="320000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Mavjud miqdor (dona) *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  required
                  defaultValue={editingProduct?.stock ?? 50}
                  placeholder="50"
                />
              </div>
              <input type="hidden" name="own_store_price" value={editingProduct?.price || 250000} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="badge">Maxsus yorliq (Badge)</Label>
                <select
                  id="badge"
                  name="badge"
                  defaultValue={editingProduct?.badge || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Yo'q</option>
                  <option value="TOP KARTINA">TOP KARTINA</option>
                  <option value="EKSKLYUZIV">EKSKLYUZIV</option>
                  <option value="QO'L ISHI">QO'L ISHI</option>
                  <option value="TABIAT">TABIAT</option>
                  <option value="AVTO">AVTO</option>
                  <option value="HIT SAVDO">HIT SAVDO</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Chegirma (%)</Label>
                <Input
                  id="discount_percentage"
                  name="discount_percentage"
                  type="number"
                  min="0"
                  max="99"
                  defaultValue={editingProduct?.discount_percentage}
                  placeholder="15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="image_url">Asosiy rasm *</Label>
                <label className="cursor-pointer text-xs font-bold text-[#7C5C3E] hover:underline flex items-center gap-1.5 bg-[#7C5C3E]/10 px-3 py-1.5 rounded-lg border border-[#7C5C3E]/30">
                  <Upload className="h-3.5 w-3.5 text-[#7C5C3E]" />
                  <span>Fayl yuklash (Kompyuter/Telefon)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const formData = new FormData()
                        formData.append("file", file)
                        try {
                          const res = await fetch("/api/upload", { method: "POST", body: formData })
                          const data = await res.json()
                          if (data.url) {
                            const input = document.getElementById("image_url") as HTMLInputElement
                            if (input) input.value = data.url
                          }
                        } catch (err) {
                          alert("Fayl yuklashda xatolik yuz berdi")
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <Input
                id="image_url"
                name="image_url"
                required
                defaultValue={editingProduct?.image_url}
                placeholder="Fayl yuklang yoki rasm havolasini kiriting..."
              />
              <p className="text-xs text-muted-foreground">Kompyuter yoki telefondan rasm faylini tanlang yoki URL kiriting.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_urls">Qo'shimcha rasmlar URL (har bir qatorga 1ta)</Label>
              <Textarea
                id="image_urls"
                name="image_urls"
                rows={3}
                defaultValue={editingProduct?.image_urls?.join("\n")}
                placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
              />
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              <Label className="font-semibold">Ramka va Rang Variatsiyalari (ixtiyoriy)</Label>
              <div id="color-variants" className="space-y-3">
                {/* Existing variants */}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[#7C5C3E] text-[#7C5C3E] hover:bg-[#7C5C3E]/10"
                onClick={() => {
                  const newVariant = {
                    id: `variant-${Date.now()}-${Math.random()}`,
                    color: "",
                    stock: 50,
                    price: 0,
                    image: "",
                  }
                  const colorVariantsField = document.querySelector('textarea[name="color_variants"]')
                  if (colorVariantsField) {
                    const variants = colorVariantsField.value ? JSON.parse(colorVariantsField.value) : []
                    variants.push(newVariant)
                    colorVariantsField.value = JSON.stringify(variants, null, 2)
                  }
                }}
              >
                + Ramka/Variant qo'shish
              </Button>
              <p className="text-xs text-muted-foreground">
                Masalan: "Qora ramkali", "Oltin ramkali", "Yog'och podramnikda" kabi variatsiyalarni kiriting.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-[#7C5C3E] hover:bg-[#7C5C3E]/90">
                {editingProduct ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Slide Dialog */}
      <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Rasmni tahrirlash" : "Yangi rasm"}</DialogTitle>
            <DialogDescription>Carousel uchun rasm ma'lumotlarini kiriting (1350x450 px).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSlide} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slide_image_url" className="font-semibold">Karusel rasmi (1350x450 px) *</Label>
                <label className="cursor-pointer text-xs font-bold text-[#7C5C3E] hover:underline flex items-center gap-1.5 bg-[#7C5C3E]/10 px-3 py-1.5 rounded-lg border border-[#7C5C3E]/30">
                  {uploadingSlideImg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-[#7C5C3E]" />}
                  <span>{uploadingSlideImg ? "Yuklanmoqda..." : "Fayl yuklash (Kompyuter/Telefon)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadingSlideImg(true)
                        const formData = new FormData()
                        formData.append("file", file)
                        try {
                          const res = await fetch("/api/upload", { method: "POST", body: formData })
                          const data = await res.json()
                          if (data.url) {
                            setSlideImageUrl(data.url)
                          }
                        } catch (err) {
                          alert("Fayl yuklashda xatolik yuz berdi")
                        } finally {
                          setUploadingSlideImg(false)
                        }
                      }
                    }}
                  />
                </label>
              </div>
              <Input
                id="slide_image_url"
                name="image_url"
                type="text"
                value={slideImageUrl}
                onChange={(e) => setSlideImageUrl(e.target.value)}
                placeholder="Fayl yuklang yoki rasm havolasini kiriting..."
                required
                className="h-11 border-[#7C5C3E]/30 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link" className="font-semibold">Havola (ixtiyoriy)</Label>
              <Input
                id="link"
                name="link"
                type="text"
                value={slideLink}
                onChange={(e) => setSlideLink(e.target.value)}
                placeholder="Havola (masalan https://... yoki bo'sh qoldiring)"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order" className="font-semibold">Tartib raqami</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                value={slideSortOrder}
                onChange={(e) => setSlideSortOrder(Number(e.target.value) || 0)}
                className="h-11"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSlideDialogOpen(false)
                  setEditingSlide(null)
                }}
                className="h-11 px-5"
              >
                Bekor qilish
              </Button>
              <Button type="submit" className="h-11 px-6 bg-[#7C5C3E] hover:bg-[#7C5C3E]/90 text-white font-bold rounded-xl" disabled={saving || uploadingSlideImg}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingSlide ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reytingni boshqarish</DialogTitle>
            <DialogDescription>
              Mahsulot reytingini sozlang. Admin reytingi foydalanuvchi reytingidan yuqori bo'lsa, u ko'rsatiladi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRating} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin_rating">Admin reytingi (1-5)</Label>
              <Input
                id="admin_rating"
                name="admin_rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                defaultValue={editingRating?.admin_rating || ""}
                placeholder="Bo'sh qoldirish = foydalanuvchi reytingi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_rating">Minimal reyting (1-5)</Label>
              <Input
                id="min_rating"
                name="min_rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                defaultValue={editingRating?.min_rating || 4.4}
              />
              <p className="text-xs text-muted-foreground">
                Agar reyting bu qiymatdan pastga tushsa, minimal qiymat ko'rsatiladi.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRatingDialogOpen(false)
                  setEditingRating(null)
                }}
              >
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-[#7C5C3E] hover:bg-[#7C5C3E]/90" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Saqlash"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

