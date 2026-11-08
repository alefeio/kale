import assert from "node:assert/strict"
import { test } from "node:test"
import { assertSeedWriteAllowed, resolveSeedDatabaseTarget } from "./seed-db-guard"

test("seed target requires explicit KALE_SEED_DATABASE_URL", () => {
  assert.throws(() => resolveSeedDatabaseTarget({}), /KALE_SEED_DATABASE_URL/)
})

test("local seed targets are allowed for apply", () => {
  const target = resolveSeedDatabaseTarget({
    KALE_SEED_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:55432/kale_test",
  })
  assert.equal(target.local, true)
  assert.equal(target.host, "127.0.0.1")
  assert.doesNotThrow(() => assertSeedWriteAllowed(target, {}))
})

test("remote seed apply is blocked without explicit override", () => {
  const target = resolveSeedDatabaseTarget({
    KALE_SEED_DATABASE_URL: "postgresql://user:pass@db.example.com:5432/prod",
  })
  assert.equal(target.local, false)
  assert.throws(() => assertSeedWriteAllowed(target, {}), /Escrita bloqueada/)
  assert.doesNotThrow(() =>
    assertSeedWriteAllowed(target, { KALE_ALLOW_REMOTE_SEED_APPLY: "true" }),
  )
})
