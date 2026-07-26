import { createClient } from "@/lib/supabase/client"
import { FavoritesPageClient } from "@/components/favorites-page-client"
import type { Product, StoreSettings } from "@/lib/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sevimlilar - Kartinka",
  description: "Sevimli devoriy rasmlaringiz ro'yxati",
}

export default async function FavoritesPage() {
  const supabase = createClient()

  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  const { data: settings } = await supabase.from("store_settings").select("*").limit(1).single()

  return <FavoritesPageClient products={(products as Product[]) || []} settings={settings as StoreSettings | null} />
}
