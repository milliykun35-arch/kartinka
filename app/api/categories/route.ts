import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")

    if (error) throw error

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error("[v0] Categories fetch error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
