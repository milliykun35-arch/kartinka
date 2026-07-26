import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userFingerprint = searchParams.get("user_fingerprint") || searchParams.get("userFingerprint")

    if (!userFingerprint) {
      return NextResponse.json([])
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("favorites").select("product_id").eq("user_fingerprint", userFingerprint)

    if (error) {
      console.error("Favorites query error:", error.message)
      return NextResponse.json([])
    }

    return NextResponse.json(data?.map((f) => f.product_id) || [])
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, userFingerprint } = body

    if (!productId || !userFingerprint) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("product_id", productId)
      .eq("user_fingerprint", userFingerprint)
      .maybeSingle()

    if (existing) {
      // Remove from favorites
      await supabase.from("favorites").delete().eq("product_id", productId).eq("user_fingerprint", userFingerprint)

      // Update count
      const { count } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId)

      await supabase
        .from("products")
        .update({ favorites_count: count || 0 })
        .eq("id", productId)

      return NextResponse.json({ favorited: false })
    }

    // Add to favorites
    const { error: insertError } = await supabase.from("favorites").insert({
      product_id: productId,
      user_fingerprint: userFingerprint,
    })

    if (insertError) {
      console.error("Insert favorite error:", insertError.message)
      return NextResponse.json({ favorited: false })
    }

    // Update count
    const { count } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId)

    await supabase
      .from("products")
      .update({ favorites_count: count || 0 })
      .eq("id", productId)

    return NextResponse.json({ favorited: true })
  } catch (error) {
    return NextResponse.json({ favorited: false })
  }
}
