export const giftCategories = [
  "cozinha",
  "mesa",
  "casa",
  "eletros",
  "banho",
] as const

export type GiftCategory = (typeof giftCategories)[number]

export type GiftStatus = "available" | "reserved"

export interface Gift {
  id: string
  name: string
  category: GiftCategory
  image: string
  description?: string
  status: GiftStatus
}

export interface GiftReservationData {
  reservedAt?: string
}

export const giftCategoryLabels: Record<GiftCategory, string> = {
  cozinha: "Cozinha",
  mesa: "Mesa",
  casa: "Casa",
  eletros: "Eletros",
  banho: "Banho",
}
