import { attachDatabasePool } from "@vercel/functions"
import { config as loadEnv } from "dotenv"
import { Pool, type PoolConfig } from "pg"
import { normalizePostgresSslMode, resolveRuntimeDatabaseUrl } from "./connection"

loadEnv({ path: ".env.local", quiet: true })
loadEnv({ path: ".env", quiet: true })

const globalForPool = globalThis as unknown as { kalePgPool?: Pool }

function redactDatabaseMessage(message: string) {
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-url]")
}

function createPool() {
  const config: PoolConfig = {
    connectionString: normalizePostgresSslMode(resolveRuntimeDatabaseUrl().url),
    max: 3,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 5_000,
  }
  const pool = new Pool(config)

  pool.on("error", (error: Error) => {
    const code = "code" in error && typeof error.code === "string" ? error.code : undefined
    console.error("Idle PostgreSQL connection error", {
      name: error.name,
      code,
      message: redactDatabaseMessage(error.message),
    })
  })

  attachDatabasePool(pool)
  return pool
}

export const pool = globalForPool.kalePgPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalForPool.kalePgPool = pool
}
