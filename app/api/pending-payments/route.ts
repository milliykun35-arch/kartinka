import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      latitude,
      longitude,
      paymentMethod,
      deliveryMethod,
      deliveryFee,
      totalAmount,
      items,
    } = body

    // Validate required fields
    if (!orderNumber || !customerName || !customerPhone || !totalAmount || !items) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    // Create pending payment record
    const { data, error } = await supabase
      .from("pending_payments")
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress || null,
        latitude: latitude || null,
        longitude: longitude || null,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod || null,
        delivery_fee: deliveryFee || 0,
        total_amount: totalAmount,
        items: items,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating pending payment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id, orderNumber })
  } catch (error: any) {
    console.error("Pending payment error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get("orderNumber")

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("pending_payments")
      .select("*")
      .eq("order_number", orderNumber)
      .single()

    if (error) {
      return NextResponse.json({ error: "Pending payment not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
