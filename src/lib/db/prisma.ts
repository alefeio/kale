import { config as loadEnv } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client"
import { pool } from "./pool"

loadEnv({ path: ".env.local", quiet: true })
loadEnv({ path: ".env", quiet: true })

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
