import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import QRCode from "qrcode"
import { buildPixBrCode } from "./pix-brcode"
import { pixQrModules } from "./pix-qr"

const official =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D"

test("official static pix payload", () => {
  const payload = buildPixBrCode("123e4567-e12b-12d1-a456-426655440000", "Fulano de Tal", "BRASILIA")
  assert.equal(payload, official)
  assert.equal(payload.includes("540"), false)
  assert.equal(payload.includes("62070503***"), true)
  assert.equal(payload.slice(-4), "1D3D")
})

test("city accents are removed only in the payload", () => {
  const payload = buildPixBrCode("123e4567-e12b-12d1-a456-426655440000", "Fulano de Tal", "Belém")
  assert.equal(payload.includes("BELEM"), true)
  assert.equal(payload.includes("Belém"), false)
})

test("qr matrix comes from the library and the br code", () => {
  const payload = buildPixBrCode("123e4567-e12b-12d1-a456-426655440000", "Fulano de Tal", "BRASILIA")
  const expected = QRCode.create(payload, { errorCorrectionLevel: "M" })
  const modules = pixQrModules(payload)
  assert.equal(modules.size, expected.modules.size)
  assert.ok(modules.size >= 21)
  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      assert.equal(modules.get(row, column), expected.modules.get(row, column))
    }
  }
})

test("demo qr generator is gone", () => {
  const component = readFileSync(new URL("../components/wedding/PixQr.tsx", import.meta.url), "utf8")
  const section = readFileSync(new URL("../components/wedding/PixSection.tsx", import.meta.url), "utf8")
  assert.equal(component.includes("buildDemoQrMatrix"), false)
  assert.equal(component.includes("demonstrativo"), false)
  assert.equal(component.includes('aria-label="QR Code PIX"'), true)
  assert.equal(section.includes("demonstrativo"), false)
  assert.equal(section.includes("Chave PIX a definir"), false)
  assert.equal(component.includes("pixQuietZone"), true)
  assert.equal(component.includes('fill="#000000"'), true)
  assert.equal(component.includes('fill="#ffffff"'), true)
})
