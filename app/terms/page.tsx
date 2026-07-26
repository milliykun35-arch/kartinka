import { Metadata } from "next"
import { TermsPageClient } from "@/components/terms-page-client"

export const metadata: Metadata = {
  title: "Shartlar va Qoidalar | Kartinka",
  description: "Kartinka devoriy rasmlar do'koni foydalanish shartlari va qoidalari",
}

export default function TermsPage() {
  return <TermsPageClient />
}
