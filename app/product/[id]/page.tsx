import { createClient } from "@/lib/supabase/server"
import { ProductDetailClientWrapper } from "@/components/product-detail-client-wrapper"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  let initialProduct = null
  let settings = null

  try {
    const supabase = await createClient()
    const [productRes, settingsRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("store_settings").select("*").limit(1).single(),
    ])
    initialProduct = productRes.data || null
    settings = settingsRes.data || null
  } catch (err) {
    console.warn("ProductPage Supabase fetch failed:", err)
  }

  return <ProductDetailClientWrapper id={id} initialProduct={initialProduct} settings={settings} />
}
