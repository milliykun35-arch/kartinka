export interface Product {
  id: string
  name_uz: string
  name_ru: string
  description_uz?: string
  description_ru?: string
  price: number
  old_price?: number
  image_url: string
  image_urls?: string[]
  uzum_link: string
  own_store_price?: number
  stock?: number
  colors?: ColorVariant[]
  color_variants?: ColorVariant[]
  badge?: string
  discount_percentage?: number
  is_active: boolean
  created_at: string
  updated_at: string
  rating: number
  rating_count: number
  favorites_count: number
  admin_rating?: number
  min_rating: number
  category_id?: string // Added category_id
}

export interface CarouselSlide {
  id: string
  image_url: string
  link?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface StoreSettings {
  id: string
  store_name: string
  about_uz?: string
  about_ru?: string
  instagram_link?: string
  telegram_link?: string
  phone?: string
  address_uz?: string
  address_ru?: string
  banner_text_uz?: string
  banner_text_ru?: string
  snow_effect_enabled?: boolean
  holiday_effects_enabled?: boolean
}

export interface Review {
  id: string
  product_id: string
  user_fingerprint: string
  user_name: string
  rating: number
  comment?: string
  created_at: string
}

export interface Favorite {
  id: string
  product_id: string
  user_fingerprint: string
  created_at: string
}

export interface ColorVariant {
  color: string
  stock: number
  price?: number
  image_url?: string // Added image_url for color variants
}

export interface Category {
  id: string
  name_uz: string
  name_ru: string
  description_uz?: string
  description_ru?: string
  icon?: string
  image_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  product_id: string
  product_name: string
  product_image?: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_address?: string
  latitude?: number
  longitude?: number
  quantity: number
  price: number
  total_amount: number
  color?: string
  status: "pending" | "confirmed" | "preparing" | "delivering" | "completed" | "cancelled"
  payment_method?: "payme" | "click" | "call" | "cash"
  payment_status?: "pending" | "paid" | "failed" | "cancelled" // Added payment_status field
  delivery_service?: string
  pickup_location?: string
  notes?: string
  created_at: string
  updated_at: string
  items?: any
  pickup_shown?: boolean
}

export type Language = "uz" | "ru"

export type SortOption = "newest" | "price_asc" | "price_desc" | "rating" | "popular"

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
}
