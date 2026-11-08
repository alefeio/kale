import { GiftManager } from "@/components/admin/AdminManagers"

export const instant = false
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/db/prisma"

export default async function GiftsPage() {
  await requireAdmin()
  const [gifts, categories] = await Promise.all([
    prisma.gift.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        categoryId: true,
        sortOrder: true,
        active: true,
        description: true,
        image: true,
        reservation: { select: { id: true } },
      },
    }),
    prisma.giftCatalogCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, active: true },
    }),
  ])

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl text-olive-dark sm:text-5xl">Presentes</h1>
      <GiftManager
        categories={categories}
        gifts={gifts.map((gift) => ({
          id: gift.id,
          name: gift.name,
          categoryId: gift.categoryId,
          sortOrder: gift.sortOrder,
          active: gift.active,
          reserved: Boolean(gift.reservation),
          description: gift.description ?? "",
          image: gift.image ?? "",
        }))}
      />
    </div>
  )
}
