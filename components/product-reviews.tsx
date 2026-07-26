"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, Upload, X, CheckCircle2, MessageSquarePlus, ThumbsUp, Sparkles, Image as ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  images: string[]
  created_at: string
  status: string
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { lang, t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [userName, setUserName] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (productId && productId !== "undefined") {
      fetchReviews()
    } else {
      setLoading(false)
    }
    const savedName = localStorage.getItem("user_name") || ""
    setUserName(savedName)
  }, [productId])

  const fetchReviews = async () => {
    if (!productId || productId === "undefined") {
      setReviews([])
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      if (!res.ok) throw new Error("Failed to fetch reviews")
      const data = await res.json()
      const reviewsArray = Array.isArray(data) ? data : data.reviews || []
      setReviews(reviewsArray)
    } catch (error) {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 3) {
      alert(t("Maksimal 3 ta rasm qo'shish mumkin", "Можно добавить максимум 3 изображения"))
      return
    }

    setImages([...images, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !comment.trim()) {
      alert(t("Iltimos, barcha maydonlarni to'ldiring", "Пожалуйста, заполните все поля"))
      return
    }

    setSubmitting(true)

    try {
      localStorage.setItem("user_name", userName)

      const imageUrls: string[] = []
      for (const image of images) {
        const formData = new FormData()
        formData.append("file", image)

        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })
          const uploadData = await uploadRes.json()
          if (uploadData.url) {
            imageUrls.push(uploadData.url)
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError)
        }
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userName,
          rating,
          comment,
          images: imageUrls,
        }),
      })

      if (res.ok) {
        alert(
          t(
            "Izohingiz qo'shildi! Tasdiqlashdan so'ng ko'rsatiladi.",
            "Ваш отзыв добавлен! Будет показан после одобрения.",
          ),
        )
        setComment("")
        setRating(5)
        setImages([])
        setImagePreviews([])
        setShowForm(false)
        fetchReviews()
      } else {
        throw new Error("Failed to submit review")
      }
    } catch (error) {
      alert(t("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.", "Произошла ошибка. Попробуйте еще раз."))
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate Average Rating
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "5.0"

  return (
    <div className="space-y-8 rounded-3xl bg-card p-6 sm:p-8 border-2 border-border shadow-xl">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-6 text-center sm:text-left">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/10 p-5 border border-[#7C5C3E]/30 min-w-[120px]">
            <span className="text-4xl sm:text-5xl font-black text-[#7C5C3E]">{avgRating}</span>
            <div className="flex gap-1 my-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{reviews.length} {t("ta izoh", "отзывов")}</span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">{t("Mijozlar fikrlari va Baholar", "Отзывы клиентов")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Har bir izoh rasmiy haridorlar tomonidan qoldirilgan", "Каждый отзыв оставлен официальными покупателями")}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#7C5C3E] to-[#A8845C] hover:from-[#5C3D1E] hover:to-[#7C5C3E] text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-[#7C5C3E]/20"
        >
          <MessageSquarePlus className="mr-2 h-5 w-5" />
          {showForm ? t("Yopish", "Закрыть") : t("Izoh qoldirish", "Оставить отзыв")}
        </Button>
      </div>

      {/* Form Drawer */}
      {showForm && (
        <Card className="p-6 border-2 border-[#7C5C3E]/30 bg-amber-500/5 rounded-2xl animate-in fade-in duration-300">
          <h4 className="text-lg font-bold mb-4 text-[#7C5C3E] flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("O'z fikringiz va rasmingizni ulashing", "Поделитесь вашим мнением")}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold mb-1 block">{t("Ismingiz *", "Ваше имя *")}</Label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t("Ismingizni kiriting", "Введите ваше имя")}
                  required
                  className="rounded-xl h-11 border-border font-semibold bg-background"
                />
              </div>

              <div>
                <Label className="text-xs font-bold mb-1 block">{t("Baho bering", "Оценка")}</Label>
                <div className="flex gap-2 h-11 items-center bg-background px-3 rounded-xl border border-border">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#7C5C3E] ml-auto">{rating} / 5</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold mb-1 block">{t("Izoh matni *", "Текст отзыва *")}</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("Devoriy rasm sifati va yetkazib berish haqida fikringiz...", "Ваше впечатление от картины...")}
                rows={3}
                required
                className="rounded-xl border-border bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-bold mb-2 block">{t("Rasm ilova qilish (max 3 ta)", "Прикрепить фото (макс 3)")}</Label>
              <div className="space-y-3">
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt=""
                          className="rounded-xl object-cover w-full h-24 border-2 border-[#7C5C3E]"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imagePreviews.length < 3 && (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#7C5C3E]/40 hover:border-[#7C5C3E] p-4 transition-colors bg-background">
                    <ImageIcon className="h-5 w-5 text-[#7C5C3E]" />
                    <span className="text-xs font-bold text-foreground">{t("Surat yuklash", "Загрузить фото")}</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#7C5C3E] hover:bg-[#5C3D1E] text-white font-bold h-12 rounded-xl"
            >
              {submitting ? t("Yuborilmoqda...", "Отправка...") : t("Izohni chop etish", "Опубликовать отзыв")}
            </Button>
          </form>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8 font-medium">{t("Yuklanmoqda...", "Загрузка...")}</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground rounded-2xl bg-muted/30 border border-dashed">
            <MessageSquarePlus className="mx-auto h-12 w-12 text-[#7C5C3E]/40 mb-2" />
            <p className="text-base font-bold text-foreground">{t("Birinchi bo'lib izoh qoldiring!", "Будьте первым, кто оставит отзыв!")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("Ushbu rasmga birinchi bahoni siz bering", "Поставьте первую оценку этой картине")}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5C3E] to-[#A8845C] font-black text-white text-base">
                    {review.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground">{review.user_name}</span>
                      <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600 bg-emerald-50 font-bold">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        {t("Xarid qilgan mijoz", "Проверенный покупатель")}
                      </Badge>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  {new Date(review.created_at).toLocaleDateString(lang === "uz" ? "uz-UZ" : "ru-RU")}
                </span>
              </div>

              <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium mb-3 pl-1">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt=""
                      className="rounded-xl object-cover h-20 w-20 border border-border shadow-sm"
                    />
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ProductReviews
