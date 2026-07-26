"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, Save, MapPin, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { StoreSettings } from "@/lib/types"

export default function ProfilePage() {
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (userData) {
      const user = JSON.parse(userData)
      setName(user.name || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
      setLatitude(user.latitude || null)
      setLongitude(user.longitude || null)
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMessage(t("Geolokatsiya qo'llab-quvvatlanmaydi", "Геолокация не поддерживается"))
      return
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLatitude(lat)
        setLongitude(lng)

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`,
          )
          const data = await response.json()
          const fullAddress = data.display_name || ""
          setAddress(fullAddress)
          setMessage(t("Manzil aniqlandi!", "Адрес определен!"))
        } catch (error) {
          console.error("[v0] Error getting address:", error)
          setMessage(t("Manzil aniqlanmadi", "Адрес не определен"))
        } finally {
          setLoadingLocation(false)
          setTimeout(() => setMessage(""), 3000)
        }
      },
      (error) => {
        console.error("[v0] Geolocation error:", error)
        setLoadingLocation(false)
        setMessage(t("Lokatsiya olishda xatolik", "Ошибка получения локации"))
        setTimeout(() => setMessage(""), 3000)
      },
    )
  }

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      setMessage(t("Iltimos, barcha maydonlarni to'ldiring", "Пожалуйста, заполните все поля"))
      return
    }

    setLoading(true)
    const userData = {
      name,
      phone,
      address,
      latitude,
      longitude,
    }
    localStorage.setItem("user_data", JSON.stringify(userData))

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        setMessage(t("Profil saqlandi!", "Профиль сохранен!"))
      } else {
        throw new Error("Failed to save profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setMessage(t("Xatolik yuz berdi", "Произошла ошибка"))
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} />
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-[#7C5C3E]" />
                {t("Profil sozlamalari", "Настройки профиля")}
              </CardTitle>
              <CardDescription>
                {t("Shaxsiy ma'lumotlaringizni tahrirlang", "Редактируйте свою личную информацию")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("Ism", "Имя")}</Label>
                <Input
                  id="name"
                  placeholder={t("Ismingizni kiriting", "Введите ваше имя")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("Telefon raqam", "Телефон")}</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+998 XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t("Manzil", "Адрес")}</Label>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-3" />
                    <Input
                      id="address"
                      placeholder={t("Manzilingizni kiriting", "Введите ваш адрес")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    className="w-full bg-transparent"
                  >
                    {loadingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Aniqlanmoqda...", "Определение...")}
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        {t("Manzilni avtomatik aniqlash", "Определить адрес автоматически")}
                      </>
                    )}
                  </Button>
                  {latitude && longitude && (
                    <p className="text-xs text-muted-foreground">
                      {t("Koordinatalar", "Координаты")}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              {message && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
                  {message}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white font-bold h-12 shadow-lg"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? t("Saqlanmoqda...", "Сохранение...") : t("Saqlash", "Сохранить")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  )
}
