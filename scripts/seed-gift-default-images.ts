/**
 * Idempotent gift default-image seeder.
 *
 * Usage:
 *   npx tsx scripts/seed-gift-default-images.ts --dry-run
 *   npx tsx scripts/seed-gift-default-images.ts --apply
 *
 * Never run against Production without explicit authorization + verified backup.
 */
import { config as loadEnv } from "dotenv"
import { planGiftDefaultImages } from "../src/lib/gift-default-images"
import { DEFAULT_GIFT_IMAGE_MANIFEST } from "../src/lib/gift-images"

loadEnv({ path: ".env.local", quiet: true })
loadEnv({ path: ".env", quiet: true })

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply")
  if (apply && argv.includes("--dry-run")) {
    throw new Error("Use apenas --dry-run ou --apply.")
  }
  return { dryRun: !apply }
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2))
  const { prisma } = await import("../src/lib/db/prisma")
  const gifts = await prisma.gift.findMany({
    where: { slug: { in: Object.keys(DEFAULT_GIFT_IMAGE_MANIFEST) } },
    select: { id: true, slug: true, image: true },
  })
  const report = planGiftDefaultImages(gifts)

  console.log(
    JSON.stringify(
      {
        mode: dryRun ? "dry-run" : "apply",
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
    for (const slug of report.updatable) {
      const image = DEFAULT_GIFT_IMAGE_MANIFEST[slug as keyof typeof DEFAULT_GIFT_IMAGE_MANIFEST]
      await prisma.gift.update({
        where: { slug },
        data: { image },
      })
    }
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Falha no seed de imagens.")
  process.exit(1)
})
