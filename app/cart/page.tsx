import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartClient } from "@/components/cart-client"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

async function getSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from("store_settings").select("*").limit(1)
  return data?.[0] || null
}

export default async function CartPage() {
  const settings = await getSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings} />
      <main className="flex-1">
        <CartClient />
      </main>
      <Footer settings={settings} />
    </div>
  )
}
