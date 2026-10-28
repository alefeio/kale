import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { failure } from "@/lib/api"
import { auth } from "@/lib/auth"

export function hasAdminRole(role: unknown) {
  if (typeof role !== "string") return false
  return role.split(",").some((item) => item.trim() === "admin")
}

export async function readSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function requireAdmin() {
  const session = await readSession()
  if (!session) redirect("/admin/login")
  if (!hasAdminRole(session.user.role)) redirect("/admin/forbidden")
  return session
}

export async function requireAdminApi() {
  const session = await readSession()
  if (!session) return { session: null, error: failure(401, "Não autorizado.") }
  if (!hasAdminRole(session.user.role)) return { session: null, error: failure(403, "Acesso negado.") }
  return { session, error: null }
}
