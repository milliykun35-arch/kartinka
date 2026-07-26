import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { DeliveryNotificationPopup } from "@/components/delivery-notification-popup"
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })
const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-outfit" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-jakarta" })

export const viewport: Viewport = {
  themeColor: "#7C5C3E",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://kartinka.uz"),
  title: {
    default: "Kartinka — Devoriy Rasmlar Galereyasi va Do'koni | Kartinalar Sotib Olish",
    template: "%s | Kartinka",
  },
  description:
    "Kartinka — O'zbekistondagi №1 devoriy rasmlar galereyasi. Tabiat, avtomobillar, masla (qo'l ishi), oyna va epoksid rasmlar. O'zingiz xohlagan o'lchamda buyurtma bering! Toshkent va butun O'zbekiston bo'ylab yetkazib berish.",
  keywords: [
    "kartinka",
    "kartinka uz",
    "kartinalar",
    "devoriy rasmlar",
    "rasmlar devorga",
    "kartina sotib olish",
    "kanvas pechat",
    "moybo'yoq kartinalar",
    "epoksid rasm",
    "oyna rasm",
    "toshkent devoriy rasmlar",
    "art print uzbekistan",
    "custom kartina",
    "kartina buyurtma berish",
    "tabiat rasmlari",
    "avto rasmlar",
  ],
  authors: [{ name: "Kartinka Art Gallery" }],
  creator: "Kartinka",
  publisher: "Kartinka Uzbekistan",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://kartinka.uz",
    siteName: "Kartinka",
    title: "Kartinka — Devoriy Rasmlar Galereyasi va Do'koni",
    description:
      "Devorlaringiz uchun sifatli kanvas, masla, oyna va epoksid rasmlar. Har qanday o'lchamda buyurtma bering!",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "Kartinka Devoriy Rasmlar Galereyasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kartinka — Devoriy Rasmlar Galereyasi",
    description: "Tabiat, avto va maxsus o'lchamdagi devoriy rasmlar do'koni.",
    images: ["/icon.svg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Structured Data Schema markup for Search Engines (Google, Yandex)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Kartinka — Devoriy Rasmlar Galereyasi",
    url: "https://kartinka.uz",
    logo: "https://kartinka.uz/icon.svg",
    description:
      "O'zbekistonda sifatli devoriy rasmlar, kanvas print, masla qo'l ishi va epoksid rasmlar do'koni.",
    telephone: "+998901234567",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toshkent",
      addressCountry: "UZ",
    },
    priceRange: "$$",
  }

  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} ${outfit.variable} ${jakarta.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider>
            <ConfirmDialogProvider>
              {children}
              <DeliveryNotificationPopup />
            </ConfirmDialogProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
