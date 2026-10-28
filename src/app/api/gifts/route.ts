import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { toPublicGiftCategory } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  await connection()

  try {
    const gifts = await prisma.gift.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        image: true,
        reservation: { select: { id: true } },
      },
    })

    return json(
      gifts.map((gift) => ({
        id: gift.id,
        name: gift.name,
        category: toPublicGiftCategory(gift.category),
        description: gift.description ?? undefined,
        image: gift.image ?? "",
        status: gift.reservation ? "reserved" : "available",
      })),
    )
  } catch {
    return failure(500, "Não foi possível carregar os presentes agora.")
  }
}
