import { connection } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { failure, json } from "@/lib/api"
import { prisma } from "@/lib/db/prisma"
import {
  INVITATION_VISIT_HOURLY_LIMIT,
  isValidVisitClientKey,
  namespaceVisitEventKey,
} from "@/lib/invitation-visits"
import { invitationTokenSchema } from "@/lib/validation"
import { z } from "zod"

const bodySchema = z.object({
  eventKey: z
    .string()
    .trim()
    .min(8)
    .max(128)
    .refine(isValidVisitClientKey, "eventKey inválido"),
})

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  await connection()
  const { token } = await context.params
  const parsedToken = invitationTokenSchema.safeParse(token)
  if (!parsedToken.success) return failure(404, "Não encontramos este convite.")

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return failure(400, "Pedido inválido.")
  }

  const parsedBody = bodySchema.safeParse(body)
  if (!parsedBody.success) return failure(400, "Pedido inválido.")

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: parsedToken.data },
      select: { id: true, active: true },
    })
    if (!invitation || !invitation.active) {
      return failure(404, "Não encontramos este convite.")
    }

    const eventKey = namespaceVisitEventKey(invitation.id, parsedBody.data.eventKey)
    const existing = await prisma.invitationVisit.findUnique({
      where: { eventKey },
      select: { id: true },
    })
    if (existing) return json({ ok: true })

    const since = new Date(Date.now() - 60 * 60 * 1000)
    const recent = await prisma.invitationVisit.count({
      where: { invitationId: invitation.id, visitedAt: { gte: since } },
    })
    if (recent >= INVITATION_VISIT_HOURLY_LIMIT) {
      return failure(429, "Muitas tentativas. Tente novamente mais tarde.")
    }

    try {
      await prisma.invitationVisit.create({
        data: {
          invitationId: invitation.id,
          eventKey,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return json({ ok: true })
      }
      throw error
    }

    return json({ ok: true })
  } catch {
    return failure(500, "Não foi possível registrar a visita agora.")
  }
}
