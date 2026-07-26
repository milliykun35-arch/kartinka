"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, MapPin, AlertCircle, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [redirectUrl, setRedirectUrl] = useState("/")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirectUrl(params.get("redirect") || "/")
  }, [])

  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationDetected, setLocationDetected] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name_uz: "",
    surname_uz: "",
    phone: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleDetectLocation = () => {
    setDetectingLocation(true)
    setError("")

    if (!("geolocation" in navigator)) {
      setError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi. Manzilni qo'lda kiriting.")
      setDetectingLocation(false)
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        let detectedAddress = `Toshkent shahri (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`,
            {
              headers: {
                "User-Agent": "Kartinka-App",
              },
            },
          )

          if (response.ok) {
            const data = await response.json()
            if (data && data.display_name) {
              // Format clean address from reverse geocoding result
              const addr = data.address || {}
              const city = addr.city || addr.town || addr.county || addr.state || "Toshkent shahri"
              const road = addr.road || addr.suburb || addr.neighbourhood || ""
              const houseNumber = addr.house_number ? `, ${addr.house_number}-uy` : ""
              detectedAddress = road ? `${city}, ${road}${houseNumber}` : data.display_name
            }
          }
        } catch (err) {
          console.warn("Reverse geocoding fallback used:", err)
        }

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: detectedAddress,
        }))
        setLocationDetected(true)
        setDetectingLocation(false)
      },
      (err) => {
        let errorMessage = "Joylashuvni aniqlab bo'lmadi."
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Joylashuv ruxsati berilmadi. Manzilni qo'lda kiriting."
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Joylashuv ma'lumoti mavjud emas. Manzilni qo'lda kiriting."
            break
          case err.TIMEOUT:
            errorMessage = "Joylashuvni aniqlash vaqti tugadi. Qayta urinib ko'ring yoki manzilni kiriting."
            break
        }
        setError(errorMessage)
        setDetectingLocation(false)
      },
      options,
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name_uz.trim()) {
      setError("Ismingizni kiriting")
      return
    }

    if (!formData.phone.trim()) {
      setError("Telefon raqamingizni kiriting")
      return
    }

    const phoneDigits = formData.phone.replace(/\D/g, "")
    if (phoneDigits.length < 9) {
      setError("Telefon raqam noto'g'ri formatda")
      return
    }

    if (!formData.address.trim()) {
      setError("Manzilni kiriting yoki 📍 tugmasini bosing")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      const fullName = formData.surname_uz.trim()
        ? `${formData.name_uz.trim()} ${formData.surname_uz.trim()}`
        : formData.name_uz.trim()

      const userData = {
        id: data.user?.id || crypto.randomUUID(),
        name: fullName,
        phone: formData.phone,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }
      localStorage.setItem("user_data", JSON.stringify(userData))

      router.push(redirectUrl)
    } catch (err) {
      setError("Tarmoq xatosi. Qaytadan urinib ko'ring.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7C5C3E]/10 via-background to-[#A8845C]/10 p-4 pb-20 sm:pb-4">
      <Suspense fallback={<Loading />}>
        <Card className="w-full max-w-md shadow-2xl border border-[#7C5C3E]/20 bg-card/90 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto mb-2 rounded-xl bg-gradient-to-br from-[#7C5C3E] to-[#A8845C] p-2.5 px-4 w-fit shadow-lg">
              <span className="text-2xl font-black text-white tracking-wide">Kartinka</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Kirish / Ro'yxatdan o'tish</CardTitle>
            <CardDescription className="text-sm">Buyurtma berish uchun ma'lumotlaringizni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name_uz" className="text-sm font-semibold">
                    Ism *
                  </Label>
                  <Input
                    id="name_uz"
                    name="name_uz"
                    value={formData.name_uz}
                    onChange={handleChange}
                    placeholder="Ism"
                    disabled={loading}
                    className="h-11 focus:border-[#7C5C3E] font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="surname_uz" className="text-sm font-semibold text-muted-foreground">
                    Familya (ixtiyoriy)
                  </Label>
                  <Input
                    id="surname_uz"
                    name="surname_uz"
                    value={formData.surname_uz}
                    onChange={handleChange}
                    placeholder="Familya"
                    disabled={loading}
                    className="h-11 focus:border-[#7C5C3E]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Telefon raqami *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+998 90 123 45 67"
                  disabled={loading}
                  className="h-11 focus:border-[#7C5C3E] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address" className="text-sm font-semibold">
                    Yetkazib berish manzili *
                  </Label>
                  {locationDetected && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Manzil aniqlandi
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Shahar, tuman, ko'cha..."
                    disabled={loading}
                    className="flex-1 h-11 focus:border-[#7C5C3E] font-medium"
                  />
                  <Button
                    type="button"
                    variant={locationDetected ? "default" : "outline"}
                    size="icon"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation || loading}
                    className={`h-11 w-11 flex-shrink-0 transition-all ${
                      locationDetected ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-[#7C5C3E] text-[#7C5C3E] hover:bg-[#7C5C3E]/10"
                    }`}
                    title="Joylashuvingizni avtomatik aniqlash"
                  >
                    {detectingLocation ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : locationDetected ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <MapPin className="h-5 w-5 text-[#7C5C3E]" />
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#7C5C3E]" />
                  <span>GPS tugmasini bossangiz manzilingiz joyida avto-teriladi</span>
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white shadow-lg shadow-[#7C5C3E]/20 rounded-xl"
                disabled={loading || detectingLocation}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Yuklanmoqda...
                  </>
                ) : (
                  "Saqlash va Davom etish"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Davom etish orqali siz{" "}
                <a href="/terms" className="text-[#7C5C3E] font-medium hover:underline">
                  foydalanish shartlari
                </a>
                ga rozilik bildirasiz
              </p>
            </form>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}
