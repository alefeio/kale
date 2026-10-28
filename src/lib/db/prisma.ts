import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client"
import { resolveRuntimeDatabaseUrl } from "./connection"

const runtimeDatabaseUrl = resolveRuntimeDatabaseUrl().url

const adapter = new PrismaPg({
  connectionString: runtimeDatabaseUrl,
})

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
