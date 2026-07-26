import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function DELETE() {
  try {
    const supabase = createServerClient()

    // Delete all cancelled and completed orders
    const { error } = await supabase.from("orders").delete().in("status", ["cancelled", "completed"])

    if (error) {
      console.error("[v0] Bulk delete error:", error)
      throw error
    }

    return NextResponse.json({ success: true, message: "Barcha eski buyurtmalar o'chirildi" })
  } catch (error: any) {
    console.error("[v0] Bulk delete error:", error)
    return NextResponse.json({ error: error?.message || "Xatolik yuz berdi" }, { status: 500 })
  }
}
