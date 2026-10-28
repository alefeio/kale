import type { GiftCategory as PrismaGiftCategory } from "../../generated/prisma/client"
import type { AttendanceStatus, Guest } from "@/types/invitation"
import type { GiftCategory } from "@/types/gift"

const categoryToPublic: Record<PrismaGiftCategory, GiftCategory> = {
  KITCHEN: "cozinha",
  TABLE: "mesa",
  HOME: "casa",
  APPLIANCES: "eletros",
  BATH: "banho",
}

export function toPublicGiftCategory(category: PrismaGiftCategory): GiftCategory {
  return categoryToPublic[category]
}

export function deriveAttendanceStatus(guests: Pick<Guest, "attending">[]): AttendanceStatus {
  if (guests.every((guest) => guest.attending === null)) return "pending"
  if (guests.some((guest) => guest.attending)) return "confirmed"
  return "declined"
}
