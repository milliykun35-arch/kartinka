import { createClient } from "@/lib/supabase/server"
import { HomePageClient } from "@/components/home-page-client"

export default async function HomePage() {
  try {
    const supabase = await createClient()

    const [productsRes, slidesRes, settingsRes] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("carousel_slides").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("store_settings").select("*").limit(1).single(),
    ])

    const products = productsRes.data || []
    const slides = slidesRes.data || []
    const settings = settingsRes.data || null

    return <HomePageClient products={products} slides={slides} settings={settings} />
  } catch (error) {
    console.error("HomePage data fetch error:", error)
    return <HomePageClient products={[]} slides={[]} settings={null} />
  }
}
