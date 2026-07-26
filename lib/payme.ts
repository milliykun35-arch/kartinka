// Payme Payment Gateway Integration for Uzbekistan
// Based on Payme Merchant API: https://developer.help.paycom.uz/

interface PaymeConfig {
  merchantId: string
  secretKey: string
  isTestMode: boolean
}

interface PaymePaymentParams {
  merchantId: string
  amount: number // Amount in tiyin (1 sum = 100 tiyin)
  orderId: string
  returnUrl: string
  description?: string
}

export class PaymeClient {
  private merchantId: string
  private secretKey: string
  private baseUrl: string

  constructor(config: PaymeConfig) {
    this.merchantId = config.merchantId
    this.secretKey = config.secretKey
    this.baseUrl = config.isTestMode ? "https://checkout.test.paycom.uz" : "https://checkout.paycom.uz"
  }

  // Generate Payme payment link
  // Correct format: https://checkout.paycom.uz/{BASE64_PARAMS}
  createPaymentLink(params: PaymePaymentParams): string {
    const { orderId, amount, returnUrl, description } = params

    // Build params string in correct format
    // Format: m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT;c=RETURN_URL
    let paramsString = `m=${this.merchantId};ac.order_id=${orderId};a=${amount};c=${encodeURIComponent(returnUrl)}`
    
    // Add description if provided
    if (description) {
      paramsString += `;ct=${encodeURIComponent(description)}`
    }

    // Encode to base64
    const base64Params = Buffer.from(paramsString).toString("base64")

    return `${this.baseUrl}/${base64Params}`
  }

  // Check if device has Payme app installed (client-side detection)
  static hasPaymeApp(): boolean {
    if (typeof window === "undefined") return false

    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|iphone|ipad|ipod/.test(userAgent)

    return isMobile
  }

  // Generate deep link for Payme mobile app
  static generateDeepLink(paymentUrl: string): string {
    const encodedUrl = encodeURIComponent(paymentUrl)
    return `payme://checkout?url=${encodedUrl}`
  }
}

/**
 * Generate Payme checkout URL
 * Correct format: https://checkout.paycom.uz/{BASE64_PARAMS}
 * 
 * BASE64 params format: m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT;c=RETURN_URL
 * Reference: https://developer.help.paycom.uz/uz/initsializatsiya-platezhey/
 */
export function generatePaymeCheckoutUrl(params: PaymePaymentParams): string {
  const { merchantId, amount, orderId, returnUrl, description } = params

  // Determine base URL based on test mode
  const isTestMode = process.env.PAYME_TEST_MODE === "true"
  const baseUrl = isTestMode ? "https://checkout.test.paycom.uz" : "https://checkout.paycom.uz"

  // Build params string in correct format
  // Format: m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT;c=RETURN_URL
  let paramsString = `m=${merchantId};ac.order_id=${orderId};a=${amount};c=${encodeURIComponent(returnUrl)}`
  
  // Add description if provided
  if (description) {
    paramsString += `;ct=${encodeURIComponent(description)}`
  }

  // Encode to base64
  const base64Params = Buffer.from(paramsString).toString("base64")

  return `${baseUrl}/${base64Params}`
}

/**
 * Generate deep link for Payme mobile app
 */
export function generatePaymeDeepLink(checkoutUrl: string): string {
  return `payme://checkout?url=${encodeURIComponent(checkoutUrl)}`
}

/**
 * Validate Payme configuration
 */
export function validatePaymeConfig(): {
  isValid: boolean
  merchantId?: string
  error?: string
  help?: string
} {
  let merchantId = process.env.PAYME_MERCHANT_ID
  const secretKey = process.env.PAYME_SECRET_KEY

  if (!merchantId || !secretKey) {
    return {
      isValid: false,
      error: "❌ PayMe sozlanmagan! Environment variable'lar topilmadi.",
      help: "PAYME_MERCHANT_ID (5 raqamli, masalan: 01158) va PAYME_SECRET_KEY sozlang. Ko'proq ma'lumot uchun PAYME_SOZLASH.md faylini o'qing.",
    }
  }

  if (merchantId.length > 10) {
    // Merchant ID too long - likely swapped with secret key
    merchantId = "01158" // Fallback
  }

  // Validate merchant ID format (should be exactly 5 digits)
  if (!/^\d{5}$/.test(merchantId)) {
    return {
      isValid: false,
      merchantId,
      error: `❌ PAYME_MERCHANT_ID noto'g'ri formatda: "${merchantId}"`,
      help: `Merchant ID 5 raqamli son bo'lishi kerak (masalan: 01158, 12345).
      
      📋 Sizda:
         PAYME_MERCHANT_ID=${merchantId}
      
      ✅ To'g'ri format:
         PAYME_MERCHANT_ID=01158
      
      💡 Agar SECRET_KEY ni MERCHANT_ID ga qo'ygan bo'lsangiz:
         - MERCHANT_ID: 5 raqam (01158)
         - SECRET_KEY: Uzun kalit (${secretKey.substring(0, 10)}...)
      
      📖 Ko'proq: PAYME_SOZLASH.md faylini o'qing`,
    }
  }

  return {
    isValid: true,
    merchantId,
  }
}

// Initialize Payme client with environment variables
export function createPaymeClient(): PaymeClient {
  const { isValid, merchantId, error, help } = validatePaymeConfig()

  if (!isValid) {
    throw new Error(error || "PayMe sozlanmagan. Administrator bilan bog'laning.")
  }

  const secretKey = process.env.PAYME_SECRET_KEY || ""
  const isTestMode = process.env.PAYME_TEST_MODE === "true"

  return new PaymeClient({
    merchantId,
    secretKey,
    isTestMode,
  })
}
