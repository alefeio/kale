/**
 * Isolated migration smoke for GiftCatalogCategory.
 *
 * Requires:
 *   KALE_SEED_DATABASE_URL=postgresql://...@127.0.0.1:.../kale_test
 *
 * Never targets Production via .env.local.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { execFileSync } from "node:child_process"
import { PrismaClient } from "../src/generated/prisma/client"
import { LEGACY_GIFT_CATEGORIES } from "../src/lib/gift-categories"
import {
  assertSeedWriteAllowed,
  redactSeedTarget,
  resolveSeedDatabaseTarget,
} from "../src/lib/seed-db-guard"
import pg from "pg"

async function main() {
  const target = resolveSeedDatabaseTarget()
  assertSeedWriteAllowed(target)
  console.log(JSON.stringify({ target: redactSeedTarget(target) }, null, 2))

  process.env.DATABASE_URL = target.url
  process.env.DIRECT_URL = target.url

  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  })

  const pool = new pg.Pool({ connectionString: target.url })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    const categories = await prisma.giftCatalogCategory.findMany({ orderBy: { sortOrder: "asc" } })
    const gifts = await prisma.gift.findMany({
      select: { id: true, slug: true, categoryId: true, image: true, reservation: { select: { id: true } } },
    })

    const legacyIds = new Set<string>(LEGACY_GIFT_CATEGORIES.map((item) => item.id))
    const foundLegacy = categories.filter((item) => legacyIds.has(item.id))
    if (foundLegacy.length < 5) {
      throw new Error(`Esperadas 5 categorias legadas, encontradas ${foundLegacy.length}.`)
    }

    const missingCategory = gifts.filter((gift) => !gift.categoryId)
    if (missingCategory.length) throw new Error("Backfill incompleto: gift sem categoryId.")

    const created = await prisma.giftCatalogCategory.create({
      data: {
        name: "Categoria Isolada",
        slug: `isolada-${Date.now()}`,
        sortOrder: 99,
        active: true,
      },
    })

    const linked = await prisma.gift.create({
      data: {
        slug: `gift-isolado-${Date.now()}`,
        name: "Presente Isolado",
        categoryId: created.id,
        legacyCategory: null,
        sortOrder: 999,
        active: true,
      },
    })

    let blocked = false
    try {
      await prisma.giftCatalogCategory.delete({ where: { id: created.id } })
    } catch {
      blocked = true
    }
    if (!blocked) throw new Error("Exclusão de categoria com presentes deveria falhar.")

    await prisma.gift.delete({ where: { id: linked.id } })
    await prisma.giftCatalogCategory.delete({ where: { id: created.id } })

    console.log(
      JSON.stringify(
        {
          legacyCategories: foundLegacy.length,
          gifts: gifts.length,
          reservations: gifts.filter((gift) => gift.reservation).length,
          protectedDelete: true,
        },
        null,
        2,
      ),
    )
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Falha na validação isolada.")
  process.exit(1)
})
