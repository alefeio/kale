import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { prisma } from "@/lib/db/prisma"
import { invitationCodeSchema } from "@/lib/validation"

const invalidCode = "Não encontramos um convite válido com este código."

export async function POST(request: Request) {
  await connection()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return failure(404, invalidCode)
  }

  const code = invitationCodeSchema.safeParse(
    typeof body === "object" && body && "code" in body ? body.code : "",
  )
  if (!code.success) return failure(404, invalidCode)

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { code: code.data },
      select: { token: true, active: true },
    })
    if (!invitation?.active) return failure(404, invalidCode)
    return json({ token: invitation.token })
  } catch {
    return failure(500, "Não foi possível abrir o convite agora.")
  }
}
