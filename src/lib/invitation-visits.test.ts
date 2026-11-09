import assert from "node:assert/strict"
import { test } from "node:test"
import {
  INVITATION_VISIT_WINDOW_MS,
  isViewedWithoutResponse,
  invitationVisitViewState,
  resolveClientVisitEventKey,
  shouldRecordInvitationVisit,
  summarizeInvitationVisits,
} from "./invitation-visits"

test("visit summary reconciles first last and count", () => {
  const a = new Date("2026-11-01T12:00:00.000Z")
  const b = new Date("2026-11-02T12:00:00.000Z")
  const c = new Date("2026-11-01T18:00:00.000Z")
  assert.deepEqual(summarizeInvitationVisits([]), {
    count: 0,
    firstVisitedAt: null,
    lastVisitedAt: null,
  })
  const summary = summarizeInvitationVisits([{ visitedAt: b }, { visitedAt: a }, { visitedAt: c }])
  assert.equal(summary.count, 3)
  assert.equal(summary.firstVisitedAt?.toISOString(), a.toISOString())
  assert.equal(summary.lastVisitedAt?.toISOString(), b.toISOString())
  assert.equal(invitationVisitViewState(0), "never")
  assert.equal(invitationVisitViewState(2), "viewed")
})

test("viewed without response requires visits and fully pending guests", () => {
  assert.equal(isViewedWithoutResponse({ visitCount: 0, guests: [{ attending: null }] }), false)
  assert.equal(isViewedWithoutResponse({ visitCount: 1, guests: [{ attending: null }] }), true)
  assert.equal(
    isViewedWithoutResponse({
      visitCount: 2,
      guests: [{ attending: null }, { attending: true }],
    }),
    false,
  )
})

test("client event key reuses window and rotates after expiry", () => {
  const first = resolveClientVisitEventKey(1_000, null, () => "key-a")
  assert.equal(first.eventKey, "key-a")
  const same = resolveClientVisitEventKey(1_000 + INVITATION_VISIT_WINDOW_MS - 1, first, () => "key-b")
  assert.equal(same.eventKey, "key-a")
  const next = resolveClientVisitEventKey(1_000 + INVITATION_VISIT_WINDOW_MS, first, () => "key-b")
  assert.equal(next.eventKey, "key-b")
})

test("visit recording only after successful visible render", () => {
  assert.equal(
    shouldRecordInvitationVisit({ viewStatus: "loading", visibilityState: "visible" }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({ viewStatus: "not-found", visibilityState: "visible" }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({ viewStatus: "error", visibilityState: "visible" }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({ viewStatus: "success", visibilityState: "hidden" }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({ viewStatus: "success", visibilityState: "prerender" }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({ viewStatus: "success", visibilityState: "visible" }),
    true,
  )
})
