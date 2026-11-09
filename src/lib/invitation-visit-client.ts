import {
  resolveClientVisitEventKey,
  sessionStorageKeyForToken,
  type ClientVisitWindowState,
} from "@/lib/invitation-visits"

function readWindow(token: string): ClientVisitWindowState | null {
  try {
    const raw = sessionStorage.getItem(sessionStorageKeyForToken(token))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ClientVisitWindowState
    if (!parsed?.eventKey || typeof parsed.startedAt !== "number") return null
    return parsed
  } catch {
    return null
  }
}

function writeWindow(token: string, state: ClientVisitWindowState) {
  try {
    sessionStorage.setItem(sessionStorageKeyForToken(token), JSON.stringify(state))
  } catch {
    // Ignore private-mode/storage failures; server idempotency still applies for retries with same key in memory.
  }
}

export async function recordInvitationVisit(token: string) {
  if (typeof window === "undefined") return
  if (document.visibilityState !== "visible") return

  const now = Date.now()
  const next = resolveClientVisitEventKey(now, readWindow(token))
  writeWindow(token, next)

  try {
    await fetch(`/api/invitations/${encodeURIComponent(token)}/visit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventKey: next.eventKey }),
      keepalive: true,
    })
  } catch {
    // Tracking must never block invitation viewing or RSVP.
  }
}
