import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { toPublicGiftCategoryFromCatalog } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  await connection()

  try {
    const [gifts, categories] = await Promise.all([
      prisma.gift.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          legacyCategory: true,
          catalogCategory: { select: { slug: true, name: true, active: true } },
          reservation: { select: { id: true } },
        },
      }),
      prisma.giftCatalogCategory.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: { slug: true, name: true },
      }),
    ])

    return json({
      categories: categories.map((category) => ({
        slug: category.slug,
        label: category.name,
      })),
      gifts: gifts.map((gift) => {
        const category = toPublicGiftCategoryFromCatalog({
          slug: gift.catalogCategory.slug,
          legacyCategory: gift.legacyCategory,
        })
        return {
          id: gift.id,
          name: gift.name,
          category,
          categoryLabel: gift.catalogCategory.name,
          description: gift.description ?? undefined,
          image: gift.image ?? "",
          status: gift.reservation ? "reserved" : "available",
        }
      }),
    })
  } catch {
    return failure(500, "Não foi possível carregar os presentes agora.")
  }
}
