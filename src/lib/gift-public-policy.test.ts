import assert from "node:assert/strict"
import { test } from "node:test"

/** Mirrors the public gifts query policy used by /api/gifts. */
function publicGiftVisible(gift: { active: boolean; categoryActive: boolean }) {
  return gift.active && gift.categoryActive
}

test("inactive categories are excluded from public catalog and Todos", () => {
  const gifts = [
    { id: "1", active: true, categoryActive: true, category: "mesa" },
    { id: "2", active: true, categoryActive: false, category: "arquivo" },
    { id: "3", active: false, categoryActive: true, category: "mesa" },
  ]
  const visible = gifts.filter((gift) => publicGiftVisible(gift))
  assert.deepEqual(
    visible.map((gift) => gift.id),
    ["1"],
  )
  assert.equal(
    visible.every((gift) => gift.categoryActive),
    true,
  )
})
