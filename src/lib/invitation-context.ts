import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const cookieName = "ka_invitation_context"
const maxAge = 180 * 24 * 60 * 60
const domain = "KALE_INVITATION_CONTEXT_V1"

type ContextPayload = {
  invitationId: string
  expiresAt: number
}

export type InvitationContext = {
  invitationId: string
  displayName: string
}

function signingKey() {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) return null
  return createHmac("sha256", secret).update(domain).digest()
}

function sign(body: string, key: Buffer) {
  return createHmac("sha256", key).update(body).digest("base64url")
}

function seal(invitationId: string) {
  const key = signingKey()
  if (!key) return null
  const payload: ContextPayload = {
    invitationId,
    expiresAt: Date.now() + maxAge * 1000,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${body}.${sign(body, key)}`
}

function open(value: string): ContextPayload | null {
  try {
    const key = signingKey()
    if (!key) return null
    const [body, mac] = value.split(".")
    if (!body || !mac) return null
    const expected = sign(body, key)
    const actual = Buffer.from(mac)
    const wanted = Buffer.from(expected)
    if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return null
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ContextPayload
    if (!parsed || typeof parsed.invitationId !== "string" || typeof parsed.expiresAt !== "number") return null
    if (parsed.expiresAt <= Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  }
}

export function attachInvitationContext(response: NextResponse, invitationId: string) {
  const value = seal(invitationId)
  if (!value) return response
  response.cookies.set(cookieName, value, cookieOptions())
  return response
}

export async function clearInvitationContext() {
  const store = await cookies()
  store.delete(cookieName)
}

export async function readInvitationContext(): Promise<InvitationContext | null> {
  try {
    const store = await cookies()
    const value = store.get(cookieName)?.value
    if (!value) return null
    const payload = open(value)
    if (!payload) return null
    const invitation = await prisma.invitation.findUnique({
      where: { id: payload.invitationId },
      select: { id: true, label: true, active: true },
    })
    if (!invitation?.active) return null
    return { invitationId: invitation.id, displayName: invitation.label }
  } catch {
    return null
  }
}
