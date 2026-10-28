import { connection } from "next/server"
import { json } from "@/lib/api"
import { requireAdminApi } from "@/lib/admin"

export async function GET() {
  await connection()
  const auth = await requireAdminApi()
  if (auth.error) return auth.error
  return json({ ok: true })
}
