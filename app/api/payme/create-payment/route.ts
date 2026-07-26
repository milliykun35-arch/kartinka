import { type NextRequest, NextResponse } from "next/server"
import { generatePaymeCheckoutUrl, generatePaymeDeepLink, validatePaymeConfig } from "@/lib/payme"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderNumber, amount, customerName } = body

    // Use orderNumber if orderId is not provided
    const finalOrderId = orderId || orderNumber

    // Validate required fields
    if (!finalOrderId || !amount) {
      return NextResponse.json({ error: "Order ID yoki order number va summa majburiy" }, { status: 400 })
    }

    // Validate Payme configuration
    const config = validatePaymeConfig()
    if (!config.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: config.error,
          details: config.help,
          instructions: {
            step1: "Vercel dashboard'ga o'ting: https://vercel.com",
            step2: "Proyektingizni tanlang → Settings → Environment Variables",
            step3: "PAYME_MERCHANT_ID ni to'g'rilang (5 raqamli, masalan: 01158)",
            step4: "PAYME_SECRET_KEY ni kiriting (uzun kalit: Dq4gIKNXp9gdcjNcNN4iUDcOrCEvN1AV?opO)",
            step5: "PAYME_TEST_MODE ni 'true' qilib qo'ying (test uchun)",
            step6: "Save tugmasini bosing va proyektni qayta deploy qiling",
          },
          documentation: "To'liq qo'llanma: PAYME_SOZLASH.md faylida",
        },
        { status: 500 },
      )
    }

    // Convert sum to tiyin (1 sum = 100 tiyin)
    const amountInTiyin = Math.round(amount * 100)

    // Generate return URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const returnUrl = `${appUrl}/orders?payment=success&order=${finalOrderId}`

    // Generate checkout URL
    const checkoutUrl = generatePaymeCheckoutUrl({
      merchantId: config.merchantId!,
      amount: amountInTiyin,
      orderId: finalOrderId,
      returnUrl,
      description: `Buyurtma #${finalOrderId}${customerName ? `: ${customerName}` : ""}`,
    })

    // Generate deep link for mobile
    const deepLink = generatePaymeDeepLink(checkoutUrl)

    return NextResponse.json({
      success: true,
      paymentLink: checkoutUrl,
      deepLink,
      orderId: finalOrderId,
      orderNumber: finalOrderId,
      amount,
      amountInTiyin,
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
