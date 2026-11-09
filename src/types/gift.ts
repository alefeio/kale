export type GiftStatus = "available" | "reserved"

/** Public category slug from GiftCatalogCategory. */
export type GiftCategory = string

export interface GiftCategoryOption {
  slug: string
  label: string
}

export interface Gift {
  id: string
  name: string
  category: GiftCategory
  categoryLabel: string
  image: string
  description?: string
  status: GiftStatus
}

export interface GiftReservationData {
  invitationCode?: string
  donorName?: string
  donorContact?: string
  message?: string
}

/** Fallback labels for known legacy slugs when a dynamic label is unavailable. */
export const giftCategoryLabels: Record<string, string> = {
  cozinha: "Cozinha",
  mesa: "Mesa",
  casa: "Casa",
  eletros: "Eletros",
  banho: "Banho",
}

/** @deprecated Prefer categories loaded from GiftCatalogCategory. */
export const giftCategories = ["cozinha", "mesa", "casa", "eletros", "banho"] as const
