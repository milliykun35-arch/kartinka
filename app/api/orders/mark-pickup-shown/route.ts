import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("orders").update({ pickup_shown: true }).eq("id", orderId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Mark pickup shown error:", error)
    return NextResponse.json({ error: "Failed to mark pickup shown" }, { status: 500 })
  }
}
