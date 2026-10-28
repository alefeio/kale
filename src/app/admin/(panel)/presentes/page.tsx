import { GiftManager } from "@/components/admin/AdminManagers"

export const instant = false
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/db/prisma"

export default async function GiftsPage() {
  await requireAdmin()
  const gifts = await prisma.gift.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      sortOrder: true,
      active: true,
      description: true,
      reservation: { select: { id: true } },
    },
  })

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl text-olive-dark sm:text-5xl">Presentes</h1>
      <GiftManager
        gifts={gifts.map((gift) => ({
          id: gift.id,
          name: gift.name,
          category: gift.category,
          sortOrder: gift.sortOrder,
          active: gift.active,
          reserved: Boolean(gift.reservation),
          description: gift.description ?? "",
        }))}
      />
    </div>
  )
}
