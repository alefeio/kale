import assert from "node:assert/strict"
import { test } from "node:test"
import { ApiError } from "@/services/http"
import {
  TEMPORARY_GIFT_LOAD_MESSAGE,
  TEMPORARY_INVITE_LOOKUP_MESSAGE,
  GIFT_REFRESH_FAILED_MESSAGE,
  canStartGuestWrite,
  classifyInvitationLoadError,
  giftListFromItems,
  giftListLoadFailure,
  loadGiftListView,
  loadInvitationView,
  lookupInvitationAccess,
} from "./guest-recovery"
import type { Gift } from "@/types/gift"
import type { Invitation } from "@/types/invitation"

const invalidMessage = "Não encontramos um convite válido com este código."

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

const sampleInvitation: Invitation = {
  token: "token-seguro",
  label: "Família",
  greeting: "Olá",
  guests: [
    { id: "g1", name: "Ana", attending: null },
    { id: "g2", name: "Bruno", attending: null },
  ],
  message: "",
  status: "pending",
}

const sampleGift: Gift = {
  id: "gift-1",
  name: "Jogo de panelas",
  category: "cozinha",
  categoryLabel: "Cozinha",
  image: "/images/gifts/panelas.jpg",
  status: "available",
}

test("valid invitation code navigates with token only on success", async () => {
  const result = await lookupInvitationAccess("ABCD12", invalidMessage, async () =>
    jsonResponse(200, { token: "abc.token" }),
  )
  assert.deepEqual(result, { kind: "success", token: "abc.token" })
})

test("invalid invitation code returns recoverable invalid message", async () => {
  const empty = await lookupInvitationAccess("   ", invalidMessage, async () => {
    throw new Error("fetch should not run")
  })
  assert.equal(empty.kind, "empty")
  assert.equal(empty.message, invalidMessage)

  const missing = await lookupInvitationAccess("ZZZZZZ", invalidMessage, async () =>
    jsonResponse(404, { error: invalidMessage }),
  )
  assert.equal(missing.kind, "invalid")
  assert.equal(missing.message, invalidMessage)
})

test("network failure and HTTP 500 return temporary recovery message", async () => {
  const network = await lookupInvitationAccess("ABCD12", invalidMessage, async () => {
    throw new TypeError("Failed to fetch")
  })
  assert.deepEqual(network, { kind: "temporary", message: TEMPORARY_INVITE_LOOKUP_MESSAGE })

  const server = await lookupInvitationAccess("ABCD12", invalidMessage, async () =>
    jsonResponse(500, { error: "down" }),
  )
  assert.deepEqual(server, { kind: "temporary", message: TEMPORARY_INVITE_LOOKUP_MESSAGE })
})

test("malformed JSON and success without token stay recoverable", async () => {
  const malformed = await lookupInvitationAccess("ABCD12", invalidMessage, async () =>
    new Response("{", { status: 200, headers: { "content-type": "application/json" } }),
  )
  assert.equal(malformed.kind, "temporary")

  const withoutToken = await lookupInvitationAccess("ABCD12", invalidMessage, async () =>
    jsonResponse(200, {}),
  )
  assert.equal(withoutToken.kind, "invalid")
})

test("retry after temporary failure can succeed", async () => {
  let calls = 0
  const fetchImpl: typeof fetch = async () => {
    calls += 1
    if (calls === 1) throw new TypeError("offline")
    return jsonResponse(200, { token: "retry-token" })
  }
  const first = await lookupInvitationAccess("ABCD12", invalidMessage, fetchImpl)
  const second = await lookupInvitationAccess("ABCD12", invalidMessage, fetchImpl)
  assert.equal(first.kind, "temporary")
  assert.deepEqual(second, { kind: "success", token: "retry-token" })
  assert.equal(canStartGuestWrite(false), true)
  assert.equal(canStartGuestWrite(true), false)
})

test("private invitation load distinguishes success, 404 and server failure", async () => {
  const success = await loadInvitationView("tok", async () => sampleInvitation)
  assert.equal(success.status, "success")

  const missing = await loadInvitationView("tok", async () => null)
  assert.equal(missing.status, "not-found")

  const server = await loadInvitationView("tok", async () => {
    throw new ApiError(500, "down")
  })
  assert.equal(server.status, "error")
  assert.notEqual(server.status, "not-found")

  const network = await loadInvitationView("tok", async () => {
    throw new TypeError("Failed to fetch")
  })
  assert.equal(network.status, "error")
  assert.notEqual(network.status, "not-found")
  assert.equal(classifyInvitationLoadError(new ApiError(404, "missing")), "not-found")
  assert.equal(classifyInvitationLoadError(new ApiError(500, "down")), "error")
})

test("invitation retry after error can return the form payload", async () => {
  let calls = 0
  const getByToken = async () => {
    calls += 1
    if (calls === 1) throw new TypeError("offline")
    return sampleInvitation
  }
  const first = await loadInvitationView("tok", getByToken)
  const second = await loadInvitationView("tok", getByToken)
  assert.equal(first.status, "error")
  assert.equal(second.status, "success")
  if (second.status === "success") {
    assert.equal(second.invitation.guests.length, 2)
    assert.equal(second.invitation.status, "pending")
  }
})

test("gift list separates loading outcomes for success empty error and retry", async () => {
  assert.deepEqual(giftListFromItems([]), { status: "empty", gifts: [] })
  assert.equal(giftListFromItems([sampleGift]).status, "success")

  const failedFresh = giftListLoadFailure(null)
  assert.equal(failedFresh.status, "error")
  assert.equal(failedFresh.gifts, null)
  assert.equal(failedFresh.message, TEMPORARY_GIFT_LOAD_MESSAGE)

  const failedRefresh = giftListLoadFailure([sampleGift])
  assert.equal(failedRefresh.refreshFailed, true)
  assert.deepEqual(failedRefresh.gifts, [sampleGift])
  assert.equal(failedRefresh.message, GIFT_REFRESH_FAILED_MESSAGE)

  let calls = 0
  const getGifts = async () => {
    calls += 1
    if (calls === 1) throw new TypeError("offline")
    if (calls === 2) throw new ApiError(500, "down")
    return [sampleGift]
  }
  const network = await loadGiftListView(getGifts)
  const server = await loadGiftListView(getGifts)
  const recovered = await loadGiftListView(getGifts)
  assert.equal(network.status, "error")
  assert.equal(server.status, "error")
  assert.equal(recovered.status, "success")
})

test("gift conflict refresh preserves existing gifts when the follow-up fetch fails", async () => {
  const previous = [sampleGift]
  const next = await loadGiftListView(async () => {
    throw new TypeError("offline")
  }, previous)
  assert.equal(next.status, "error")
  if (next.status === "error") {
    assert.deepEqual(next.gifts, previous)
    assert.equal(next.refreshFailed, true)
    assert.equal(next.message, GIFT_REFRESH_FAILED_MESSAGE)
  }
})
