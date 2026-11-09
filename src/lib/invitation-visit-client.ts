import {
  resolveClientVisitEventKey,
  sessionStorageKeyForToken,
  type ClientVisitWindowState,
} from "@/lib/invitation-visits"

const memoryWindows = new Map<string, ClientVisitWindowState>()

function readWindow(token: string): ClientVisitWindowState | null {
  const memory = memoryWindows.get(token)
  if (memory) return memory
  try {
    const raw = sessionStorage.getItem(sessionStorageKeyForToken(token))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ClientVisitWindowState
    if (!parsed?.eventKey || typeof parsed.startedAt !== "number") return null
    memoryWindows.set(token, parsed)
    return parsed
  } catch {
    return null
  }
}

function writeWindow(token: string, state: ClientVisitWindowState) {
  memoryWindows.set(token, state)
  try {
    sessionStorage.setItem(sessionStorageKeyForToken(token), JSON.stringify(state))
  } catch {
    // Private mode: memory map still keeps the same idempotent key for retries.
  }
}

async function postVisit(token: string, eventKey: string) {
  const response = await fetch(`/api/invitations/${encodeURIComponent(token)}/visit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ eventKey }),
    keepalive: true,
  })
  if (response.ok) return { ok: true as const }
  return { ok: false as const, status: response.status }
}

/**
 * Best-effort visit recording. Browser automation can still execute JS.
 * Never blocks invitation viewing or RSVP.
 */
export async function recordInvitationVisit(token: string) {
  if (typeof window === "undefined") return
  if (document.visibilityState !== "visible") return

  const now = Date.now()
  const next = resolveClientVisitEventKey(now, readWindow(token))
  writeWindow(token, next)

  try {
    const first = await postVisit(token, next.eventKey)
    if (first.ok) return
    // One limited retry with the same idempotent key for transient failures.
    if (first.status >= 500 || first.status === 429) {
      await postVisit(token, next.eventKey)
    }
  } catch {
    try {
      await postVisit(token, next.eventKey)
    } catch {
      // Ignore — tracking must never block the guest journey.
    }
  }
}
