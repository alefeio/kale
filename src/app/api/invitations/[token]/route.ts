import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { deriveAttendanceStatus } from "@/lib/db/mappers"
import { prisma } from "@/lib/db/prisma"
import { invitationTokenSchema } from "@/lib/validation"

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  await connection()
  const { token } = await context.params
  const parsed = invitationTokenSchema.safeParse(token)
  if (!parsed.success) return failure(404, "Não encontramos este convite.")

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: parsed.data },
      select: {
        label: true,
        greeting: true,
        active: true,
        guests: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, attending: true },
        },
        response: { select: { note: true } },
      },
    })

    if (!invitation || !invitation.active) {
      return failure(404, "Não encontramos este convite.")
    }

    return json({
      token: parsed.data,
      label: invitation.label,
      greeting: invitation.greeting ?? "",
      guests: invitation.guests,
      message: invitation.response?.note ?? "",
      status: deriveAttendanceStatus(invitation.guests),
    })
  } catch {
    return failure(500, "Não foi possível carregar o convite agora.")
  }
}
