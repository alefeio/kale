import { connection } from "next/server"
import { json } from "@/lib/api"
import { readInvitationContext } from "@/lib/invitation-context"

export async function GET() {
  await connection()
  try {
    const context = await readInvitationContext()
    if (!context) return json({ recognized: false })
    return json({ recognized: true, displayName: context.displayName })
  } catch {
    return json({ recognized: false })
  }
}
