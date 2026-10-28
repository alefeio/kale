import { config as loadEnv } from "dotenv"
import { defineConfig } from "prisma/config"
import { resolveDirectDatabaseUrl } from "./src/lib/db/connection"

loadEnv({ path: ".env.local", quiet: true })
loadEnv({ path: ".env", quiet: true })

const directDatabaseUrl = resolveDirectDatabaseUrl().url

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts",
  },
  datasource: {
    url: directDatabaseUrl,
  },
})
