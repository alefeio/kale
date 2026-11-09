import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { toPublicGiftCategoryFromCatalog } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"
import { resolvePublicGiftImage } from "@/lib/gift-images"
import { existingGiftImages } from "@/lib/media"

export async function GET() {
  await connection()

  try {
    const availableLocalImages = existingGiftImages()
    const [gifts, categories] = await Promise.all([
      prisma.gift.findMany({
        // Inactive categories stay hidden from the public catalog (filters and "Todos").
        where: { active: true, catalogCategory: { active: true } },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
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
          image: resolvePublicGiftImage(gift.slug, gift.image, availableLocalImages),
          status: gift.reservation ? "reserved" : "available",
        }
      }),
    })
  } catch {
    return failure(500, "Não foi possível carregar os presentes agora.")
  }
}
