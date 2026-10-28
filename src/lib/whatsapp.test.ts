import assert from "node:assert/strict"
import { test } from "node:test"
import { invitationShareText } from "./invitation-link"
import { whatsappDestinations, whatsappInternationalNumber, whatsappShareUrl } from "./whatsapp"

const shareText = invitationShareText("https://kaeale.vercel.app/convite/token-privado", "ABCDEFGHJK")

test("whatsapp without a number keeps the message and has no recipient", () => {
  const url = whatsappShareUrl({ text: shareText })
  assert.equal(url.startsWith("https://wa.me/?text="), true)
  assert.equal(decodeURIComponent(url.slice("https://wa.me/?text=".length)), shareText)
  assert.equal(whatsappDestinations([{ name: "Teste", whatsapp: null }]).length, 0)
})

test("one whatsapp becomes the international number", () => {
  const destinations = whatsappDestinations([{ name: "Teste", whatsapp: "91999999999" }])
  assert.equal(destinations.length, 1)
  assert.equal(destinations[0]?.phone, "5591999999999")
  assert.equal(whatsappInternationalNumber("91999999999"), "5591999999999")
  const url = whatsappShareUrl({ phone: destinations[0]?.phone, text: shareText })
  assert.equal(url.startsWith("https://wa.me/5591999999999?text="), true)
  assert.equal(decodeURIComponent(url.split("?text=")[1] ?? ""), shareText)
})

test("several whatsapp numbers stay separate and include another contact", () => {
  const destinations = whatsappDestinations([
    { name: "Maria", whatsapp: "91999999999" },
    { name: "João", whatsapp: "91988888888" },
  ])
  assert.equal(destinations.length, 2)
  assert.deepEqual(
    destinations.map((item) => item.phone),
    ["5591999999999", "5591988888888"],
  )
  const other = whatsappShareUrl({ text: shareText })
  assert.equal(other.startsWith("https://wa.me/?text="), true)
})

test("duplicate whatsapp numbers collapse", () => {
  const destinations = whatsappDestinations([
    { name: "Maria", whatsapp: "91999999999" },
    { name: "João", whatsapp: "91999999999" },
  ])
  assert.equal(destinations.length, 1)
  assert.equal(destinations[0]?.label, "Maria / João")
  assert.equal(destinations[0]?.display, "(91) 99999-9999")
})
