export const TELEGRAM_BOT_TOKEN = "8855202665:AAFZXnL1V12UE6eHx3ngD4Sn2X0GK7LEzW8"
export const TELEGRAM_ADMIN_CHAT_ID = "636895270"

interface TelegramOrderPayload {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  totalAmount: number
  items: Array<{
    name: string
    material?: string
    size?: string
    price?: number
    quantity?: number
  }>
}

export async function sendTelegramOrderNotification(order: TelegramOrderPayload) {
  try {
    const itemsText = order.items
      .map((item, idx) => {
        const mat = item.material ? ` (${item.material})` : ""
        const sz = item.size ? ` [${item.size}]` : ""
        const priceStr = item.price ? ` — ${item.price.toLocaleString()} so'm` : ""
        const qtyStr = item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ""
        return `${idx + 1}. <b>${item.name}</b>${mat}${sz}${qtyStr}${priceStr}`
      })
      .join("\n")

    const message = `
🚨 <b>YANGI BUYURTMA KELDI!</b>

🆔 <b>Buyurtma ID:</b> <code>#${order.orderNumber}</code>
👤 <b>Mijoz:</b> ${order.customerName}
📞 <b>Telefon:</b> ${order.customerPhone}
📍 <b>Manzil:</b> ${order.customerAddress || "Kiritilmagan"}

📦 <b>Xarid qilingan rasmlar:</b>
${itemsText}

💰 <b>JAMI SUMMA:</b> <b>${order.totalAmount.toLocaleString()} so'm</b>
⏰ <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
`.trim()

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    const resData = await response.json()
    console.log("Telegram bot order notification sent:", resData.ok)
    return resData.ok
  } catch (error) {
    console.error("Failed to send Telegram notification:", error)
    return false
  }
}
