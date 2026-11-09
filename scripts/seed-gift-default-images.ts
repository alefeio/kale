/**
 * Idempotent gift default-image seeder.
 *
 * Usage:
 *   KALE_SEED_DATABASE_URL=postgresql://... npx tsx scripts/seed-gift-default-images.ts --dry-run
 *   KALE_SEED_DATABASE_URL=postgresql://... npx tsx scripts/seed-gift-default-images.ts --apply
 *
 * Never loads .env.local automatically. Never run against Production without explicit authorization.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { planGiftDefaultImages } from "../src/lib/gift-default-images"
import { DEFAULT_GIFT_IMAGE_MANIFEST } from "../src/lib/gift-images"
import {
  assertSeedWriteAllowed,
  redactSeedTarget,
  resolveSeedDatabaseTarget,
} from "../src/lib/seed-db-guard"
import pg from "pg"

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply")
  if (apply && argv.includes("--dry-run")) {
    throw new Error("Use apenas --dry-run ou --apply.")
  }
  return { dryRun: !apply }
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2))
  const target = resolveSeedDatabaseTarget()
  console.log(
    JSON.stringify(
      {
        mode: dryRun ? "dry-run" : "apply",
        target: redactSeedTarget(target),
      },
      null,
      2,
    ),
  )

  if (!dryRun) assertSeedWriteAllowed(target)

  const pool = new pg.Pool({ connectionString: target.url })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    const gifts = await prisma.gift.findMany({
      where: { slug: { in: Object.keys(DEFAULT_GIFT_IMAGE_MANIFEST) } },
      select: { id: true, slug: true, image: true },
    })
    const report = planGiftDefaultImages(gifts)

    console.log(
      JSON.stringify(
        {
          found: report.found.length,
          updatable: report.updatable.length,
          ignoredCustom: report.ignoredCustom.length,
          missing: report.missing.length,
          details: report,
        },
        null,
        2,
      ),
    )

    if (!dryRun) {
      let updated = 0
      for (const slug of report.updatable) {
        const image = DEFAULT_GIFT_IMAGE_MANIFEST[slug as keyof typeof DEFAULT_GIFT_IMAGE_MANIFEST]
        // Conditional write: only fill empty image at write time (concurrency-safe).
        const result = await prisma.gift.updateMany({
          where: {
            slug,
            OR: [{ image: null }, { image: "" }],
          },
          data: { image },
        })
        updated += result.count
      }
      console.log(JSON.stringify({ updated }, null, 2))
    }
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Falha no seed de imagens.")
  process.exit(1)
})
