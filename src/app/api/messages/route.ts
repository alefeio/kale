import { connection } from "next/server"
import { failure, json } from "@/lib/api"
import { prisma } from "@/lib/db/prisma"
import { coupleMessageSchema } from "@/lib/validation"

export async function POST(request: Request) {
  await connection()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return failure(400, "Não foi possível guardar a mensagem agora.")
  }

  const parsed = coupleMessageSchema.safeParse(body)
  if (!parsed.success) return failure(400, "Não foi possível guardar a mensagem agora.")

  try {
    await prisma.message.create({
      data: {
        name: parsed.data.name,
        message: parsed.data.message,
      },
    })
    return json({ ok: true })
  } catch {
    return failure(500, "Não foi possível guardar a mensagem agora.")
  }
}
