import assert from "node:assert/strict"
import { test } from "node:test"
import { normalizePixKey, validatePixSettings } from "./pix-key"
import { publicPixContent, type PublicPixSettings } from "./pix-public"

const base = {
  pixEnabled: true,
  pixKeyType: "EVP",
  pixKey: "123e4567-e12b-12d1-a456-426655440000",
  pixReceiver: "Fulano de Tal",
  pixCity: "BRASILIA",
}

test("disabled pix can be saved without a key", () => {
  const result = validatePixSettings({ ...base, pixEnabled: false, pixKeyType: "", pixKey: "", pixReceiver: "", pixCity: "" })
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.data.pixEnabled, false)
  assert.equal(result.data.pixKey, null)
})

test("disabling keeps an existing key", () => {
  const result = validatePixSettings({ ...base, pixEnabled: false })
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.data.pixEnabled, false)
  assert.equal(result.data.pixKey, base.pixKey)
  assert.equal(result.data.pixReceiver, base.pixReceiver)
})

test("active pix without a key is rejected", () => {
  const result = validatePixSettings({ ...base, pixKey: "" })
  assert.equal(result.ok, false)
  if (result.ok) return
  assert.equal(result.error, "Preencha todos os dados do PIX antes de ativá-lo.")
})

test("phone key normalization", () => {
  for (const input of ["(91) 99999-9999", "+55 91 99999-9999", "91999999999"]) {
    const result = normalizePixKey("PHONE", input)
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.value, "+5591999999999")
  }
})

test("email key normalization", () => {
  const result = normalizePixKey("EMAIL", "  Admin@Example.com ")
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.value, "admin@example.com")
})

test("cpf key normalization", () => {
  const result = normalizePixKey("CPF", "390.533.447-05")
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.value, "39053344705")
  assert.equal(normalizePixKey("CPF", "111.111.111-11").ok, false)
})

test("cnpj key normalization", () => {
  const result = normalizePixKey("CNPJ", "11.444.777/0001-61")
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.value, "11444777000161")
  assert.equal(normalizePixKey("CNPJ", "11.111.111/1111-11").ok, false)
})

test("evp key keeps its original form", () => {
  const key = "123E4567-E12B-12D1-A456-426655440000"
  const result = normalizePixKey("EVP", key)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.value, key)
  assert.equal(normalizePixKey("EVP", "nao-e-uuid").ok, false)
})

test("public pix stays hidden without an active configuration", () => {
  const hidden: PublicPixSettings = {
    pixEnabled: false,
    pixKeyType: null,
    pixKey: null,
    pixReceiver: null,
    pixCity: "BELEM",
  }
  assert.equal(publicPixContent(hidden), null)
  assert.equal(publicPixContent({ ...hidden, pixEnabled: true }), null)
})

test("public pix uses the saved configuration", () => {
  const content = publicPixContent({
    pixEnabled: true,
    pixKeyType: "EVP",
    pixKey: base.pixKey,
    pixReceiver: base.pixReceiver,
    pixCity: base.pixCity,
  })
  assert.ok(content)
  assert.equal(content?.key, base.pixKey)
  assert.equal(content?.receiver, base.pixReceiver)
  assert.equal(content?.payload.includes(base.pixKey), true)
  assert.equal(content?.payload.includes("62070503***"), true)
})
