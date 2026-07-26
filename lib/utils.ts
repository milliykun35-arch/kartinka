import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 0,
  }).format(price)
}

export function cleanImageUrl(url?: string): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900"
  }

  let clean = url.trim()

  // Convert ImgBB webpage viewer links (e.g. https://ibb.co/0RFgssp6) to direct image source
  if (clean.includes("ibb.co/") && !clean.includes("i.ibb.co/")) {
    const parts = clean.split("ibb.co/")
    if (parts[1]) {
      const code = parts[1].split("/")[0]
      clean = `https://i.ibb.co/${code}/image.jpg`
    }
  }

  // If URL is already proxied through wsrv.nl, return as is
  if (clean.includes("wsrv.nl/?url=")) {
    return clean
  }

  // If URL is from Pinterest (i.pinimg.com, pinterest.com, pin.it), route through wsrv.nl proxy to bypass 403 hotlink blocking
  if (clean.includes("pinimg.com") || clean.includes("pinterest") || clean.includes("pin.it")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(clean)}`
  }

  return clean
}
