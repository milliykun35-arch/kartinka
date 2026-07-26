import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, params, id } = body

    const supabase = await createClient()
    const secretKey = process.env.PAYME_SECRET_KEY || ""

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: { code: -32504, message: "Unauthorized" } }, { status: 401 })
    }

    switch (method) {
      case "CheckPerformTransaction":
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", params.account.order_id)
          .single()

        if (!order) {
          return NextResponse.json({
            error: { code: -31050, message: "Order not found" },
          })
        }

        if (order.payment_status === "paid") {
          return NextResponse.json({
            error: { code: -31051, message: "Order already paid" },
          })
        }

        return NextResponse.json({ result: { allow: true }, id })

      case "CreateTransaction":
        const { data: createOrder } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", params.account.order_id)
          .single()

        if (!createOrder) {
          return NextResponse.json({
            error: { code: -31050, message: "Order not found" },
          })
        }

        await supabase
          .from("orders")
          .update({
            payment_method: "payme",
            payment_status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", createOrder.id)

        return NextResponse.json({
          result: {
            create_time: Date.now(),
            transaction: params.id,
            state: 1,
          },
          id,
        })

      case "PerformTransaction":
        // Get pending payment data
        const { data: pendingPayment, error: pendingError } = await supabase
          .from("pending_payments")
          .select("*")
          .eq("order_number", params.account.order_id)
          .eq("status", "pending")
          .single()

        if (pendingError || !pendingPayment) {
          return NextResponse.json({
            error: { code: -31050, message: "Pending payment not found" },
          })
        }

        // Create orders from pending payment items
        const items = pendingPayment.items as any[]
        for (const item of items) {
          await supabase.from("orders").insert({
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
            payment_method: pendingPayment.payment_method,
            delivery_method: pendingPayment.delivery_method,
            delivery_fee: pendingPayment.delivery_fee,
            order_number: pendingPayment.order_number,
            status: "pending",
            payment_status: "paid",
          })
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
          message: `Buyurtma #${params.account.order_id}: ${items.length} ta mahsulot, ${pendingPayment.total_amount.toLocaleString()} so'm (Payme)`,
          is_read: false,
        })

        return NextResponse.json({
          result: {
            perform_time: Date.now(),
            transaction: params.id,
            state: 2,
          },
          id,
        })

      case "CancelTransaction":
        const { data: cancelOrder } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", params.account.order_id)
          .single()

        if (cancelOrder) {
          await supabase
            .from("orders")
            .update({
              payment_status: "cancelled",
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", cancelOrder.id)
        }

        return NextResponse.json({
          result: {
            cancel_time: Date.now(),
            transaction: params.id,
            state: -2,
          },
          id,
        })

      default:
        return NextResponse.json({
          error: { code: -32601, message: "Method not found" },
        })
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: { code: -32400, message: "Internal server error" },
      },
      { status: 500 },
    )
  }
}
