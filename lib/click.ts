// Click Payment Gateway Integration for Uzbekistan
// Based on Click API: https://docs.click.uz/

interface ClickConfig {
  merchantId: string
  serviceId: string
  secretKey: string
  isTestMode: boolean
}

interface ClickPaymentParams {
  merchantId: string
  serviceId: string
  amount: number
  orderId: string
  returnUrl: string
  description?: string
}

export class ClickClient {
  private merchantId: string
  private serviceId: string
  private secretKey: string
  private baseUrl: string

  constructor(config: ClickConfig) {
    this.merchantId = config.merchantId
    this.serviceId = config.serviceId
    this.secretKey = config.secretKey
    this.baseUrl = config.isTestMode ? "https://my.click.uz/services/pay" : "https://my.click.uz/services/pay"
  }

  createPaymentLink(params: ClickPaymentParams): string {
    const { orderId, amount, returnUrl, description } = params

    const urlParams = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: amount.toString(),
      transaction_param: orderId,
      return_url: returnUrl,
    })

    if (description) {
      urlParams.append("merchant_trans_id", description)
    }

    console.log("[v0] Creating Click payment link:")
    console.log("[v0] - Merchant ID:", this.merchantId)
    console.log("[v0] - Service ID:", this.serviceId)
    console.log("[v0] - Amount:", amount, "so'm")
    console.log("[v0] - Order ID:", orderId)

    return `${this.baseUrl}?${urlParams.toString()}`
  }

  static hasClickApp(): boolean {
    if (typeof window === "undefined") return false
    const userAgent = navigator.userAgent.toLowerCase()
    return /android|iphone|ipad|ipod/.test(userAgent)
  }
}

export function generateClickCheckoutUrl(params: ClickPaymentParams): string {
  const { merchantId, serviceId, amount, orderId, returnUrl, description } = params

  const urlParams = new URLSearchParams({
    service_id: serviceId,
    merchant_id: merchantId,
    amount: amount.toString(),
    transaction_param: orderId,
    return_url: returnUrl,
  })

  if (description) {
    urlParams.append("merchant_trans_id", description)
  }

  const isTestMode = process.env.CLICK_TEST_MODE === "true"
  const baseUrl = "https://my.click.uz/services/pay"

  return `${baseUrl}?${urlParams.toString()}`
}

export function validateClickConfig(): {
  isValid: boolean
  merchantId?: string
  serviceId?: string
  error?: string
} {
  const merchantId = process.env.CLICK_MERCHANT_ID
  const serviceId = process.env.CLICK_SERVICE_ID
  const secretKey = process.env.CLICK_SECRET_KEY

  if (!merchantId || !serviceId || !secretKey) {
    return {
      isValid: false,
      error:
        "Click sozlanmagan. CLICK_MERCHANT_ID, CLICK_SERVICE_ID va CLICK_SECRET_KEY environment variables'ni sozlang.",
    }
  }

  return {
    isValid: true,
    merchantId,
    serviceId,
  }
}

export function createClickClient(): ClickClient {
  const { isValid, merchantId, serviceId, error } = validateClickConfig()

  if (!isValid) {
    console.error("[v0] ❌ Click to'lov tizimi sozlanmagan!")
    console.error("[v0] ERROR:", error)
    throw new Error(error || "Click sozlanmagan")
  }

  const secretKey = process.env.CLICK_SECRET_KEY || ""
  const isTestMode = process.env.CLICK_TEST_MODE === "true"

  console.log(`[v0] ✓ Click initialized`)
  console.log(`[v0] - Test mode: ${isTestMode}`)
  console.log(`[v0] - Merchant ID: ${merchantId}`)
  console.log(`[v0] - Service ID: ${serviceId}`)

  return new ClickClient({
    merchantId,
    serviceId,
    secretKey,
    isTestMode,
  })
}
