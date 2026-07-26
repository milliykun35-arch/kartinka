export interface MaterialOption {
  id: string
  name_uz: string
  name_ru: string
  description_uz: string
  description_ru: string
  badge?: string
}

export interface SizeOption {
  label: string
  width: number
  height: number
  price: number
  isTriptych?: boolean
}

export const MATERIALS: MaterialOption[] = [
  {
    id: "pechat",
    name_uz: "Pechat (Kanvas print)",
    name_ru: "Печать (Принт на холсте)",
    description_uz: "Sifatli kanvas matoga ultrabinafsha chop etish",
    description_ru: "УФ-печать на качественном холсте",
    badge: "Ommabop",
  },
  {
    id: "masla",
    name_uz: "Masla (Qo'l ishi)",
    name_ru: "Масло (Ручная работа)",
    description_uz: "Rassom tomonidan moybo'yoqda qo'lda chizilgan",
    description_ru: "Ручная роспись маслом от художника",
    badge: "Eksklyuziv",
  },
  {
    id: "oyna",
    name_uz: "Oyna (Glass print)",
    name_ru: "Стекло (Печать на стекле)",
    description_uz: "Mustahkam oyna ortiga bosilgan yorqin rasm",
    description_ru: "Яркая печать на прочном стекле",
  },
  {
    id: "epoksid",
    name_uz: "Epoksid (Epoxy resin)",
    name_ru: "Эпоксидная смола",
    description_uz: "Epoksid smolasi bilan qoplangan premium 3D effekt",
    description_ru: "Премиальный 3D эффект с эпоксидной смолой",
    badge: "Premium",
  },
]

export const PRESET_SIZES: Record<string, SizeOption[]> = {
  pechat: [
    { label: "55x40 cm", width: 55, height: 40, price: 140000 },
    { label: "90x60 cm", width: 90, height: 60, price: 250000 },
    { label: "115x60 cm", width: 115, height: 60, price: 300000 },
    { label: "125x50 cm", width: 125, height: 50, price: 340000 },
    { label: "80x80 cm", width: 80, height: 80, price: 360000 },
    { label: "125x80 cm", width: 125, height: 80, price: 400000 },
    { label: "100x100 cm", width: 100, height: 100, price: 550000 },
    { label: "150x80 cm", width: 150, height: 80, price: 600000 },
    { label: "130x170 cm", width: 130, height: 170, price: 700000 },
    { label: "80x50 cm (3 tali triptix)", width: 80, height: 50, price: 750000, isTriptych: true },
    { label: "80x80 cm (3 tali triptix)", width: 80, height: 80, price: 800000, isTriptych: true },
  ],
  masla: [
    { label: "90x60 cm", width: 90, height: 60, price: 650000 },
    { label: "80x80 cm", width: 80, height: 80, price: 750000 },
    { label: "125x80 cm", width: 125, height: 80, price: 950000 },
  ],
  oyna: [
    { label: "90x60 cm", width: 90, height: 60, price: 540000 },
  ],
  epoksid: [
    { label: "70x60 cm", width: 70, height: 60, price: 546000 },
  ],
}

export function calculateCustomPrice(materialId: string, widthCm: number, heightCm: number): number {
  if (!widthCm || !heightCm || widthCm <= 0 || heightCm <= 0) return 0

  const area = widthCm * heightCm

  // Base rates per cm² and minimum base prices
  switch (materialId) {
    case "masla":
      return Math.max(500000, Math.round((area * 95) / 1000) * 1000)
    case "oyna":
      return Math.max(400000, Math.round((area * 100) / 1000) * 1000)
    case "epoksid":
      return Math.max(450000, Math.round((area * 130) / 1000) * 1000)
    case "pechat":
    default:
      return Math.max(120000, Math.round((area * 46) / 1000) * 1000)
  }
}
