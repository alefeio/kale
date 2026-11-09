import { Prisma } from "@/generated/prisma/client"
import { connection } from "next/server"
import { json } from "@/lib/api"
import { toPublicGiftCategoryFromCatalog } from "@/lib/db/mappers"
import { resolvePublicGiftImage } from "@/lib/gift-images"
import { prisma } from "@/lib/db/prisma"
import { readInvitationContext } from "@/lib/invitation-context"
import { existingGiftImages } from "@/lib/media"
import { invitationCodeSchema, publicReserveSchema, recognizedReserveSchema, recordIdSchema } from "@/lib/validation"

const takenMessage =
  "Este presente acabou de ser reservado por outra pessoa. Escolha outra sugestão com carinho. ❤️"
const invalidCodeMessage = "Não encontramos esse código."

function invalidCode() {
  return json({ error: invalidCodeMessage, code: "INVALID_INVITATION_CODE" }, 422)
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection()
  const { id } = await context.params
  const parsedId = recordIdSchema.safeParse(id)
  if (!parsedId.success) return json({ error: "Não encontramos este presente." }, 404)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const recognized = await readInvitationContext()
  let donorName = ""
  let donorContact: string | null = null
  let invitationId: string | null = recognized?.invitationId ?? null
  let message: string | undefined

  if (recognized) {
    const parsed = recognizedReserveSchema.safeParse(body)
    if (!parsed.success) return json({ error: "Não foi possível reservar agora." }, 400)
    donorName = recognized.displayName
    donorContact = null
    invitationId = recognized.invitationId
    message = parsed.data.message
  } else {
    const parsed = publicReserveSchema.safeParse(body)
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0]
      if (field === "donorContact") return json({ error: "Informe um WhatsApp válido." }, 400)
      return json({ error: "Conte seu nome para reservar este presente." }, 400)
    }
    donorName = parsed.data.donorName
    donorContact = parsed.data.donorContact
    message = parsed.data.message
    const rawCode = parsed.data.invitationCode
    if (rawCode) {
      const code = invitationCodeSchema.safeParse(rawCode)
      if (!code.success) return invalidCode()
      const invitation = await prisma.invitation.findUnique({
        where: { code: code.data },
        select: { id: true, active: true },
      })
      if (!invitation?.active) return invalidCode()
      invitationId = invitation.id
    }
  }

  try {
    const reserved = await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({
        where: { id: parsedId.data },
        select: {
          id: true,
          slug: true,
          name: true,
          legacyCategory: true,
          description: true,
          image: true,
          active: true,
          catalogCategory: { select: { slug: true, name: true, active: true } },
          reservation: { select: { id: true } },
        },
      })

      if (!gift || !gift.active || !gift.catalogCategory.active) return null
      if (gift.reservation) throw new Error("TAKEN")

      if (invitationId) {
        const invitation = await tx.invitation.findUnique({
          where: { id: invitationId },
          select: { active: true },
        })
        if (!invitation?.active) invitationId = null
      }

      await tx.giftReservation.create({
        data: {
          giftId: gift.id,
          invitationId,
          donorName,
          donorContact,
          message,
        },
      })

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
        image: resolvePublicGiftImage(gift.slug, gift.image, existingGiftImages()),
        status: "reserved" as const,
      }
    })

    if (!reserved) return json({ error: "Não encontramos este presente." }, 404)
    return json(reserved)
  } catch (error) {
    if (error instanceof Error && error.message === "TAKEN") {
      return json({ error: takenMessage }, 409)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return json({ error: takenMessage }, 409)
    }
    return json({ error: "Não foi possível reservar agora." }, 500)
  }
}
