export const INVITATION_VISIT_WINDOW_MS = 15 * 60 * 1000
export const INVITATION_VISIT_HOURLY_LIMIT = 30

export type InvitationVisitSummary = {
  count: number
  firstVisitedAt: Date | null
  lastVisitedAt: Date | null
}

export type InvitationVisitViewState = "never" | "viewed"

export function summarizeInvitationVisits(
  visits: Array<{ visitedAt: Date }>,
): InvitationVisitSummary {
  if (visits.length === 0) {
    return { count: 0, firstVisitedAt: null, lastVisitedAt: null }
  }
  let first = visits[0].visitedAt
  let last = visits[0].visitedAt
  for (const visit of visits) {
    if (visit.visitedAt < first) first = visit.visitedAt
    if (visit.visitedAt > last) last = visit.visitedAt
  }
  return { count: visits.length, firstVisitedAt: first, lastVisitedAt: last }
}

export function invitationVisitViewState(count: number): InvitationVisitViewState {
  return count > 0 ? "viewed" : "never"
}

export function isViewedWithoutResponse(input: {
  visitCount: number
  guests: Array<{ attending: boolean | null }>
}) {
  if (input.visitCount < 1) return false
  return input.guests.every((guest) => guest.attending === null)
}

export function sessionStorageKeyForToken(token: string) {
  return `kale.invite.visit.v1:${token}`
}

export type ClientVisitWindowState = {
  eventKey: string
  startedAt: number
}

export function resolveClientVisitEventKey(
  now: number,
  previous: ClientVisitWindowState | null,
  createKey: () => string = () => crypto.randomUUID(),
  windowMs = INVITATION_VISIT_WINDOW_MS,
): ClientVisitWindowState {
  if (previous && now - previous.startedAt < windowMs && previous.eventKey.trim()) {
    return previous
  }
  return { eventKey: createKey(), startedAt: now }
}

export function shouldRecordInvitationVisit(input: {
  viewStatus: "loading" | "success" | "not-found" | "error"
  visibilityState: DocumentVisibilityState | "visible" | "hidden" | "prerender"
}) {
  if (input.viewStatus !== "success") return false
  return input.visibilityState === "visible"
}
