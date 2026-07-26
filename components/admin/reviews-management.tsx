"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star } from "lucide-react"
import Image from "next/image"

interface Review {
  id: string
  product_id: string
  user_name: string
  rating: number
  comment: string
  images: string[] | null
  status: string
  created_at: string
  products?: {
    name_uz: string
    name_ru: string
  }
}

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews?status=all")
      const data = await res.json()
      const dbReviews = Array.isArray(data) ? data : []
      const localReviews = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("local_reviews") || "[]") : []
      const merged = [...localReviews, ...dbReviews.filter((r: any) => !localReviews.some((lr: any) => lr.id === r.id))]
      setReviews(merged)
    } catch (error) {
      const localReviews = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("local_reviews") || "[]") : []
      setReviews(localReviews)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      fetchReviews()
    } catch (error) {
      console.error("Failed to approve review:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      })
      fetchReviews()
    } catch (error) {
      console.error("Failed to reject review:", error)
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
      />
    ))
  }

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Izohlarni tasdiqlash</h2>
        <Badge variant="secondary">{reviews.length} ta izoh</Badge>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Izohlar yo'q</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        review.status === "approved"
                          ? "default"
                          : review.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {review.status === "approved"
                        ? "Tasdiqlangan"
                        : review.status === "pending"
                          ? "Kutilmoqda"
                          : "Rad etilgan"}
                    </Badge>
                    <span className="font-semibold">{review.user_name}</span>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>

                  {review.products && (
                    <p className="text-sm text-muted-foreground">
                      Mahsulot: {review.products.name_uz || review.products.name_ru}
                    </p>
                  )}

                  <p className="text-sm">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border">
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`Review ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("uz-UZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {review.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Tasdiqlash
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(review.id)}>
                      <X className="h-4 w-4 mr-1" />
                      Rad etish
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
