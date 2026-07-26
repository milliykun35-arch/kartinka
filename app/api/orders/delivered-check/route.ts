import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json({ orders: [] })
    }

    const supabase = await createClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_number, product_name, product_image, delivery_service, pickup_location, customer_phone")
      .eq("customer_phone", phone)
      .eq("status", "completed")
      .eq("pickup_shown", false)
      .not("delivery_service", "is", null)
      .not("pickup_location", "is", null)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error("[v0] Delivered check error:", error)
    return NextResponse.json({ orders: [] })
  }
}
