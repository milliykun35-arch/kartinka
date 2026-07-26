import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const status = searchParams.get("status")

    const supabase = await createClient()

    if (status === "all") {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products (
            name_uz,
            name_ru
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Reviews query error:", error.message)
        return NextResponse.json([])
      }

      return NextResponse.json(data || [])
    }

    if (!productId || productId === "undefined" || productId === "null") {
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Reviews by product error:", error.message)
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, userFingerprint, userName, rating, comment, images } = body

    if (!productId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const fingerprint = userFingerprint || crypto.randomUUID()

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_fingerprint", fingerprint)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 400 })
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      product_id: productId,
      user_fingerprint: fingerprint,
      user_name: userName || "Mehmon",
      rating,
      comment,
      images: images || [],
      status: "pending",
    })

    if (insertError) {
      console.error("Insert review error:", insertError.message)
      return NextResponse.json({ success: false })
    }

    try {
      await supabase.from("admin_notifications").insert({
        type: "review",
        title: "Yangi izoh",
        message: `${userName || "Mehmon"} mahsulotga ${rating} yulduz bilan izoh qoldirdi`,
        is_read: false,
      })
    } catch (notifError) {
      // Non-critical notification error
    }

    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("status", "approved")

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

      const { data: product } = await supabase
        .from("products")
        .select("min_rating, admin_rating")
        .eq("id", productId)
        .single()

      const minRating = product?.min_rating || 4.4
      const finalRating = product?.admin_rating || Math.max(avgRating, minRating)

      await supabase
        .from("products")
        .update({
          rating: Number(finalRating.toFixed(1)),
          rating_count: reviews.length,
        })
        .eq("id", productId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false })
  }
}
