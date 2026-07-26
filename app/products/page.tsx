import { createClient } from "@/lib/supabase/server"
import { ProductsPageClient } from "@/components/products-page-client"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  try {
    const supabase = await createClient()

    const [productsRes, settingsRes] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("store_settings").select("*").limit(1).single(),
    ])

    return <ProductsPageClient products={productsRes.data || []} settings={settingsRes.data || null} />
  } catch (error) {
    console.error("ProductsPage data fetch error:", error)
    return <ProductsPageClient products={[]} settings={null} />
  }
}
