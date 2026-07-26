import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id,
      amount,
      action,
      error,
      error_note,
      sign_time,
      sign_string,
    } = body

    const supabase = await createClient()
    const secretKey = process.env.CLICK_SECRET_KEY || ""

    const signString = `${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${action}${sign_time}`
    const generatedSign = crypto.createHash("md5").update(signString).digest("hex")

    if (generatedSign !== sign_string) {
      return NextResponse.json({
        error: -1,
        error_note: "Invalid signature",
      })
    }

    // Action 0: prepare transaction
    if (action === 0) {
      const { data: order } = await supabase.from("orders").select("*").eq("order_number", merchant_trans_id).single()

      if (!order) {
        return NextResponse.json({
          error: -5,
          error_note: "Order not found",
        })
      }

      if (order.payment_status === "paid") {
        return NextResponse.json({
          error: -4,
          error_note: "Order already paid",
        })
      }

      return NextResponse.json({
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: order.id,
        error: 0,
        error_note: "Success",
      })
    }

    // Action 1: complete transaction
    if (action === 1) {
      if (error < 0) {
        const { data: order } = await supabase.from("orders").select("*").eq("order_number", merchant_trans_id).single()

        if (order) {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)
        }

        return NextResponse.json({
          error: -9,
          error_note: "Transaction failed",
        })
      }

      // Get pending payment data
      const { data: pendingPayment, error: pendingError } = await supabase
        .from("pending_payments")
        .select("*")
        .eq("order_number", merchant_trans_id)
        .eq("status", "pending")
        .single()

      if (pendingError || !pendingPayment) {
        return NextResponse.json({
          error: -5,
          error_note: "Pending payment not found",
        })
      }

      // Create orders from pending payment items
      const items = pendingPayment.items as any[]
      let firstOrderId = ""
      for (const item of items) {
        const { data: newOrder } = await supabase.from("orders").insert({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          customer_name: pendingPayment.customer_name,
          customer_phone: pendingPayment.customer_phone,
          customer_address: pendingPayment.customer_address,
          latitude: pendingPayment.latitude,
          longitude: pendingPayment.longitude,
          price: item.price,
          total_amount: item.price * item.quantity,
          color: item.color,
          quantity: item.quantity,
          payment_method: "click",
          delivery_method: pendingPayment.delivery_method,
          delivery_fee: pendingPayment.delivery_fee,
          order_number: pendingPayment.order_number,
          status: "pending",
          payment_status: "paid",
        }).select().single()
        
        if (!firstOrderId && newOrder) firstOrderId = newOrder.id
      }

      // Mark pending payment as paid
      await supabase
        .from("pending_payments")
        .update({ status: "paid" })
        .eq("id", pendingPayment.id)

      // Create admin notification
      await supabase.from("admin_notifications").insert({
        type: "payment",
        title: "Yangi buyurtma - To'lov qilindi",
        message: `Buyurtma #${merchant_trans_id}: ${items.length} ta mahsulot, ${pendingPayment.total_amount.toLocaleString()} so'm (Click)`,
        is_read: false,
      })

      return NextResponse.json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: firstOrderId || pendingPayment.id,
        error: 0,
        error_note: "Success",
      })
    }

    return NextResponse.json({
      error: -3,
      error_note: "Invalid action",
    })
  } catch (error: any) {
    return NextResponse.json({
      error: -8,
      error_note: "Internal server error",
    })
  }
}
