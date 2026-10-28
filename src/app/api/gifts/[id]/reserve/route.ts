import { Prisma } from "@/generated/prisma/client"
import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { toPublicGiftCategory } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"
import { recordIdSchema, reserveGiftSchema } from "@/lib/validation"

const takenMessage =
  "Este presente acabou de ser reservado por outra pessoa. Escolha outra sugestão com carinho. ❤️"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection()
  const { id } = await context.params
  const parsedId = recordIdSchema.safeParse(id)
  if (!parsedId.success) return failure(404, "Não encontramos este presente.")

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return failure(400, "Não foi possível reservar agora.")
  }

  const parsed = reserveGiftSchema.safeParse(body)
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0]
    if (field === "invitationCode") {
      return failure(404, "Não encontramos um convite válido com este código.")
    }
    if (field === "donorContact") return failure(400, "Informe um WhatsApp válido.")
    return failure(400, "Conte seu nome para reservar este presente.")
  }

  try {
    const reserved = await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({
        where: { id: parsedId.data },
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          image: true,
          active: true,
          reservation: { select: { id: true } },
        },
      })

      if (!gift || !gift.active) return null
      if (gift.reservation) throw new Error("TAKEN")

      const invitation = await tx.invitation.findUnique({
        where: { code: parsed.data.invitationCode },
        select: { id: true, active: true },
      })
      if (!invitation?.active) throw new Error("INVALID_CODE")

      await tx.giftReservation.create({
        data: {
          giftId: gift.id,
          invitationId: invitation.id,
          donorName: parsed.data.donorName,
          donorContact: parsed.data.donorContact,
          message: parsed.data.message,
        },
      })

      return {
        id: gift.id,
        name: gift.name,
        category: toPublicGiftCategory(gift.category),
        description: gift.description ?? undefined,
        image: gift.image ?? "",
        status: "reserved" as const,
      }
    })

    if (!reserved) return failure(404, "Não encontramos este presente.")
    return json(reserved)
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CODE") {
      return failure(404, "Não encontramos um convite válido com este código.")
    }
    if (error instanceof Error && error.message === "TAKEN") {
      return failure(409, takenMessage)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return failure(409, takenMessage)
    }
    return failure(500, "Não foi possível reservar agora.")
  }
}
