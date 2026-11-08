import type { GiftCategory as PrismaGiftCategory } from "../../generated/prisma/client"
import type { AttendanceStatus, Guest } from "@/types/invitation"
import type { GiftCategory } from "@/types/gift"
import { LEGACY_GIFT_CATEGORIES } from "@/lib/gift-categories"

const categoryToPublic: Record<PrismaGiftCategory, GiftCategory> = {
  KITCHEN: "cozinha",
  TABLE: "mesa",
  HOME: "casa",
  APPLIANCES: "eletros",
  BATH: "banho",
}

/** @deprecated Prefer catalogCategory.slug from GiftCatalogCategory. */
export function toPublicGiftCategory(category: PrismaGiftCategory): GiftCategory {
  return categoryToPublic[category]
}

export function toPublicGiftCategoryFromCatalog(input: {
  slug: string
  legacyCategory?: PrismaGiftCategory | null
}): GiftCategory {
  if (input.slug.trim()) return input.slug
  if (input.legacyCategory) return categoryToPublic[input.legacyCategory]
  return LEGACY_GIFT_CATEGORIES[0].slug
}

export function deriveAttendanceStatus(guests: Pick<Guest, "attending">[]): AttendanceStatus {
  if (guests.every((guest) => guest.attending === null)) return "pending"
  if (guests.some((guest) => guest.attending)) return "confirmed"
  return "declined"
}
