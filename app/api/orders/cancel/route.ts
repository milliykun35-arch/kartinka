import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID kerak" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: order, error: fetchError } = await supabase.from("orders").select("status").eq("id", orderId).single()

    if (fetchError) throw fetchError

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Faqat tasdiqlanmagan buyurtmalarni bekor qilish mumkin" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (updateError) throw updateError

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: "cancelled",
      note: "Mijoz tomonidan bekor qilindi",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order cancel error:", error)
    return NextResponse.json({ error: "Buyurtmani bekor qilishda xatolik" }, { status: 500 })
  }
}
