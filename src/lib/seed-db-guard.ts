export type SeedDatabaseTarget = {
  source: string
  url: string
  host: string
  database: string
  local: boolean
}

function parseDatabaseUrl(url: string, source: string): SeedDatabaseTarget {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`URL de banco inválida (${source}).`)
  }
  const host = parsed.hostname.toLowerCase()
  const database = parsed.pathname.replace(/^\//, "") || "(default)"
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")
  return { source, url, host, database, local }
}

/**
 * Resolve the DB target for administrative seed scripts.
 * Never silently falls back to .env.local / production URLs.
 */
type EnvLike = Record<string, string | undefined>

export function resolveSeedDatabaseTarget(env: EnvLike = process.env): SeedDatabaseTarget {
  const explicit = env.KALE_SEED_DATABASE_URL?.trim()
  if (explicit) return parseDatabaseUrl(explicit, "KALE_SEED_DATABASE_URL")

  throw new Error(
    "Defina KALE_SEED_DATABASE_URL com o PostgreSQL isolado. O seed não carrega .env.local automaticamente.",
  )
}

export function assertSeedWriteAllowed(target: SeedDatabaseTarget, env: EnvLike = process.env): void {
  if (target.local) return
  if (env.KALE_ALLOW_REMOTE_SEED_APPLY === "true") return
  throw new Error(
    `Escrita bloqueada para host não local (${target.host}/${target.database}). Use Postgres isolado ou defina KALE_ALLOW_REMOTE_SEED_APPLY=true com autorização explícita.`,
  )
}

export function redactSeedTarget(target: SeedDatabaseTarget) {
  return {
    source: target.source,
    host: target.host,
    database: target.database,
    local: target.local,
  }
}
