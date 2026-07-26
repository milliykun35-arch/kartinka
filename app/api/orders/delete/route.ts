import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "Order ID kerak" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if order exists and get its status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("status, created_at")
      .eq("id", orderId)
      .maybeSingle()

    if (fetchError) {
      console.error("[v0] Order fetch error:", fetchError)
      return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: "Buyurtma topilmadi yoki allaqachon o'chirilgan" }, { status: 404 })
    }

    // Only allow deleting completed or cancelled orders
    if (!["completed", "cancelled"].includes(order.status)) {
      return NextResponse.json(
        { error: "Faqat yetkazilgan yoki bekor qilingan buyurtmalarni o'chirish mumkin" },
        { status: 400 },
      )
    }

    // Delete order status history first (foreign key constraint)
    await supabase.from("order_status_history").delete().eq("order_id", orderId)

    // Delete the order
    const { error: deleteError } = await supabase.from("orders").delete().eq("id", orderId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true, message: "Buyurtma muvaffaqiyatli o'chirildi" })
  } catch (error) {
    console.error("[v0] Order delete error:", error)
    return NextResponse.json({ error: "Buyurtmani o'chirishda xatolik" }, { status: 500 })
  }
}
