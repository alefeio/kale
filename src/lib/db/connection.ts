const directCandidates = [
  "DIRECT_URL",
  "DATABASE_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
] as const

const runtimeCandidates = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "DIRECT_URL",
] as const

export type DatabaseConnectionName =
  | (typeof directCandidates)[number]
  | "DATABASE_URL_POOLED"

function read(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function firstDefined(names: readonly string[]) {
  for (const name of names) {
    const value = read(name)
    if (value) return { name: name as DatabaseConnectionName, url: value }
  }
  return null
}

export function resolveDirectDatabaseUrl() {
  const resolved = firstDefined(directCandidates)
  if (!resolved) {
    throw new Error("Nenhuma variável de conexão PostgreSQL foi encontrada.")
  }
  return resolved
}

const relaxedSslModes = new Set(["require", "prefer", "verify-ca"])

export function normalizePostgresSslMode(rawUrl: string) {
  let sslmode: string | null
  try {
    sslmode = new URL(rawUrl).searchParams.get("sslmode")?.toLowerCase() ?? null
  } catch {
    return rawUrl
  }
  if (!sslmode || !relaxedSslModes.has(sslmode)) return rawUrl
  return rawUrl.replace(/([?&]sslmode=)(?:require|prefer|verify-ca)(?=&|#|$)/i, "$1verify-full")
}

export function resolveRuntimeDatabaseUrl() {
  const pooled = read("DATABASE_URL_POOLED")
  if (pooled) {
    return { name: "DATABASE_URL_POOLED" as const, url: pooled, pooled: true as const }
  }

  const resolved = firstDefined(runtimeCandidates)
  if (!resolved) {
    throw new Error("Nenhuma variável de conexão PostgreSQL foi encontrada.")
  }

  return { ...resolved, pooled: false as const }
}
