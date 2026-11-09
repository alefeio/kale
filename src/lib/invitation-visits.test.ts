import assert from "node:assert/strict"
import { test } from "node:test"
import {
  INVITATION_VISIT_HISTORY_LIMIT,
  INVITATION_VISIT_WINDOW_MS,
  invitationVisitSummaryFromAggregates,
  isViewedWithoutResponse,
  invitationVisitViewState,
  namespaceVisitEventKey,
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

test("aggregate summary keeps real totals beyond history limit", () => {
  const first = new Date("2026-10-01T15:00:00.000Z")
  const last = new Date("2026-11-08T21:30:00.000Z")
  for (const count of [0, 1, 20, 21, 35]) {
    const summary = invitationVisitSummaryFromAggregates({
      count,
      firstVisitedAt: count ? first : null,
      lastVisitedAt: count ? last : null,
    })
    assert.equal(summary.count, count)
    if (count === 0) {
      assert.equal(summary.firstVisitedAt, null)
      assert.equal(summary.lastVisitedAt, null)
    } else {
      assert.equal(summary.firstVisitedAt?.toISOString(), first.toISOString())
      assert.equal(summary.lastVisitedAt?.toISOString(), last.toISOString())
    }
  }
  assert.equal(INVITATION_VISIT_HISTORY_LIMIT, 20)
  assert.equal(
    invitationVisitSummaryFromAggregates({
      count: 35,
      firstVisitedAt: first,
      lastVisitedAt: last,
    }).count > INVITATION_VISIT_HISTORY_LIMIT,
    true,
  )
})

test("America/Belem formatting remains stable for visit timestamps", () => {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Belem",
  })
  const value = new Date("2026-11-08T21:30:00.000Z")
  const label = formatter.format(value)
  assert.equal(label.includes("08/11/2026") || label.includes("11/08/2026"), true)
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
  const first = resolveClientVisitEventKey(1_000, null, () => "key-aaaa")
  assert.equal(first.eventKey, "key-aaaa")
  const same = resolveClientVisitEventKey(1_000 + INVITATION_VISIT_WINDOW_MS - 1, first, () => "key-bbbb")
  assert.equal(same.eventKey, "key-aaaa")
  const next = resolveClientVisitEventKey(1_000 + INVITATION_VISIT_WINDOW_MS, first, () => "key-bbbb")
  assert.equal(next.eventKey, "key-bbbb")
})

test("namespaced event keys isolate invitations", () => {
  assert.equal(namespaceVisitEventKey("inv_a", "same-key"), "inv_a:same-key")
  assert.notEqual(namespaceVisitEventKey("inv_a", "same-key"), namespaceVisitEventKey("inv_b", "same-key"))
})

test("visit recording only after successful visible matching token", () => {
  assert.equal(
    shouldRecordInvitationVisit({
      viewStatus: "loading",
      visibilityState: "visible",
      routeToken: "token-a",
      invitationToken: "token-a",
    }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({
      viewStatus: "success",
      visibilityState: "hidden",
      routeToken: "token-a",
      invitationToken: "token-a",
    }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({
      viewStatus: "success",
      visibilityState: "visible",
      routeToken: "token-a",
      invitationToken: "token-b",
    }),
    false,
  )
  assert.equal(
    shouldRecordInvitationVisit({
      viewStatus: "success",
      visibilityState: "visible",
      routeToken: "token-a",
      invitationToken: "token-a",
    }),
    true,
  )
})
