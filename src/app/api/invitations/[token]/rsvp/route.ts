import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { deriveAttendanceStatus } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"
import { invitationTokenSchema, rsvpSchema } from "@/lib/validation"

export async function PUT(
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
    return failure(400, "Não foi possível guardar a confirmação.")
  }

  const parsed = rsvpSchema.safeParse(body)
  if (!parsed.success) return failure(400, "Não foi possível guardar a confirmação.")

  const guestIds = parsed.data.guests.map((guest) => guest.id)
  if (new Set(guestIds).size !== guestIds.length) {
    return failure(400, "Não foi possível guardar a confirmação.")
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({
        where: { token: parsedToken.data },
        select: { id: true, active: true, label: true, greeting: true },
      })

      if (!invitation || !invitation.active) return null

      for (const guest of parsed.data.guests) {
        const result = await tx.guest.updateMany({
          where: { id: guest.id, invitationId: invitation.id },
          data: { attending: guest.attending },
        })
        if (result.count !== 1) {
          throw new Error("INVALID_GUEST")
        }
      }

      await tx.rsvpResponse.upsert({
        where: { invitationId: invitation.id },
        create: {
          invitationId: invitation.id,
          note: parsed.data.message,
        },
        update: {
          note: parsed.data.message,
        },
      })

      const guests = await tx.guest.findMany({
        where: { invitationId: invitation.id },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, attending: true },
      })

      return {
        token: parsedToken.data,
        label: invitation.label,
        greeting: invitation.greeting ?? "",
        guests,
        message: parsed.data.message ?? "",
        status: deriveAttendanceStatus(guests),
      }
    })

    if (!updated) return failure(404, "Não encontramos este convite.")
    return json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_GUEST") {
      return failure(400, "Não foi possível guardar a confirmação.")
    }
    return failure(500, "Não foi possível guardar a confirmação agora.")
  }
}
