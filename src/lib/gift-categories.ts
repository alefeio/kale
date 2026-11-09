import type { GiftCategory as LegacyGiftCategory } from "@/generated/prisma/client"

export type LegacyGiftCategoryCode = LegacyGiftCategory

export const LEGACY_GIFT_CATEGORIES = [
  {
    id: "gcat_cozinha",
    name: "Cozinha",
    slug: "cozinha",
    sortOrder: 1,
    legacy: "KITCHEN" as const,
  },
  {
    id: "gcat_mesa",
    name: "Mesa",
    slug: "mesa",
    sortOrder: 2,
    legacy: "TABLE" as const,
  },
  {
    id: "gcat_casa",
    name: "Casa",
    slug: "casa",
    sortOrder: 3,
    legacy: "HOME" as const,
  },
  {
    id: "gcat_eletros",
    name: "Eletros",
    slug: "eletros",
    sortOrder: 4,
    legacy: "APPLIANCES" as const,
  },
  {
    id: "gcat_banho",
    name: "Banho",
    slug: "banho",
    sortOrder: 5,
    legacy: "BATH" as const,
  },
] as const

export function legacyCodeForCategorySlug(slug: string): LegacyGiftCategoryCode | null {
  const match = LEGACY_GIFT_CATEGORIES.find((item) => item.slug === slug)
  return match?.legacy ?? null
}

export function categoryIdForLegacyCode(code: LegacyGiftCategoryCode): string {
  const match = LEGACY_GIFT_CATEGORIES.find((item) => item.legacy === code)
  if (!match) throw new Error(`Categoria legada desconhecida: ${code}`)
  return match.id
}

export function slugifyCategoryName(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "categoria"
}
