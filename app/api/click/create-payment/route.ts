import { type NextRequest, NextResponse } from "next/server"
import { generateClickCheckoutUrl, validateClickConfig } from "@/lib/click"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber, amount, customerName } = body

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Order ID va summa majburiy" }, { status: 400 })
    }

    const config = validateClickConfig()
    if (!config.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: config.error,
          instructions: {
            step1: "Click business'ga ro'yxatdan o'ting: https://my.click.uz",
            step2: "Merchant ID, Service ID va Secret Key oling",
            step3: "Vercel dashboard → Settings → Environment Variables",
            step4: "CLICK_MERCHANT_ID, CLICK_SERVICE_ID, CLICK_SECRET_KEY qo'shing",
            step5: "CLICK_TEST_MODE ni 'true' qiling (test uchun)",
          },
        },
        { status: 500 },
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const returnUrl = `${appUrl}/orders?payment=success&order=${orderNumber || orderId}`

    const checkoutUrl = generateClickCheckoutUrl({
      merchantId: config.merchantId!,
      serviceId: config.serviceId!,
      amount,
      orderId: orderNumber || orderId,
      returnUrl,
      description: `Buyurtma #${orderNumber || orderId}${customerName ? `: ${customerName}` : ""}`,
    })

    return NextResponse.json({
      success: true,
      paymentLink: checkoutUrl,
      orderId,
      orderNumber,
      amount,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "To'lov yaratishda xatolik",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
