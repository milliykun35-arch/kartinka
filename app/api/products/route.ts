import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const sort = searchParams.get("sort") || "created_at"
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    const supabase = await createClient()

    let query = supabase
      .from("products")
      .select("*, product_variants(*), categories(name_uz, name_ru)")
      .eq("is_active", true)

    if (search) {
      query = query.or(
        `name_uz.ilike.%${search}%,name_ru.ilike.%${search}%,description_uz.ilike.%${search}%,description_ru.ilike.%${search}%`,
      )
    }

    if (category && category !== "all") {
      query = query.eq("category_id", category)
    }

    if (sort === "rating") {
      query = query.order("rating", { ascending: false })
    } else if (sort === "price_asc") {
      query = query.order("price", { ascending: true })
    } else if (sort === "price_desc") {
      query = query.order("price", { ascending: false })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    query = query.limit(limit)

    const { data: products, error } = await query

    if (error) {
      console.error("Products query error:", error.message)
      return NextResponse.json({ products: [], total: 0 })
    }

    return NextResponse.json({ products: products || [], total: products?.length || 0 })
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ products: [], total: 0 })
  }
}
