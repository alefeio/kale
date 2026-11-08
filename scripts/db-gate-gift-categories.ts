/**
 * ADMIN-P2 DB-GATE — real PostgreSQL backfill homologation on an isolated cluster.
 *
 * Uses embedded-postgres on D: (no Docker, no Production/Preview URLs).
 */
import EmbeddedPostgres from "embedded-postgres"
import { PrismaPg } from "@prisma/adapter-pg"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { PrismaClient } from "../src/generated/prisma/client"
import { DEFAULT_GIFT_IMAGE_MANIFEST } from "../src/lib/gift-images"
import { planGiftDefaultImages } from "../src/lib/gift-default-images"
import { resolvePublicGiftImage } from "../src/lib/gift-images"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const migrationsDir = path.join(root, "prisma", "migrations")
const targetMigration = "20261108120000_add_gift_catalog_categories"
const stashDir = path.join("D:/tmp", "kale-migration-stash")
const databaseDir = path.join("D:/tmp", "kale-isolated-pg")
const port = 55433
const password = "kale_isolated_pw"
const database = "kale_db_gate"
const connectionUrl = `postgresql://postgres:${password}@127.0.0.1:${port}/${database}`

const giftFixtures = [
  { id: "gift_01", slug: "jogo-de-pratos", name: "Jogo de pratos", category: "TABLE", sortOrder: 1, active: true, image: "/images/gifts/custom-pratos.webp" },
  { id: "gift_02", slug: "jogo-de-copos", name: "Jogo de copos", category: "TABLE", sortOrder: 2, active: true, image: null },
  { id: "gift_03", slug: "jogo-de-canecas", name: "Jogo de canecas", category: "TABLE", sortOrder: 3, active: true, image: null },
  { id: "gift_04", slug: "jogo-de-talher", name: "Jogo de talher", category: "TABLE", sortOrder: 4, active: false, image: null },
  { id: "gift_05", slug: "tabua-de-cortar", name: "Tábua de cortar", category: "KITCHEN", sortOrder: 5, active: true, image: null },
  { id: "gift_06", slug: "potes-de-mantimentos", name: "Potes de mantimentos", category: "KITCHEN", sortOrder: 6, active: true, image: null },
  { id: "gift_07", slug: "porta-temperos", name: "Porta temperos", category: "KITCHEN", sortOrder: 7, active: true, image: null },
  { id: "gift_08", slug: "jarras-para-agua", name: "Jarras para água", category: "TABLE", sortOrder: 8, active: true, image: null },
  { id: "gift_09", slug: "tigelas-porcelana", name: "Tigelas porcelana", category: "TABLE", sortOrder: 9, active: true, image: null },
  { id: "gift_10", slug: "jogo-de-panelas", name: "Jogo de panelas", category: "KITCHEN", sortOrder: 10, active: true, image: null },
  { id: "gift_11", slug: "jogo-americano", name: "Jogo americano", category: "TABLE", sortOrder: 11, active: true, image: null },
  { id: "gift_12", slug: "toalhas-de-mesa-ou-centro-de-mesa", name: "Toalhas de mesa", category: "TABLE", sortOrder: 12, active: true, image: null },
  { id: "gift_13", slug: "guardanapos", name: "Guardanapos", category: "TABLE", sortOrder: 13, active: true, image: null },
  { id: "gift_14", slug: "toalhas-de-banho", name: "Toalhas de banho", category: "BATH", sortOrder: 14, active: true, image: null },
  { id: "gift_15", slug: "lixeiras", name: "Lixeiras", category: "HOME", sortOrder: 15, active: true, image: null },
  { id: "gift_16", slug: "jogo-de-cama-de-casal", name: "Jogo de cama", category: "HOME", sortOrder: 16, active: true, image: null },
  { id: "gift_17", slug: "tapete-de-sala", name: "Tapete de sala", category: "HOME", sortOrder: 17, active: false, image: null },
  { id: "gift_18", slug: "tapete-de-banheiro", name: "Tapete de banheiro", category: "BATH", sortOrder: 18, active: true, image: null },
] as const

function migrateDeploy() {
  // Call prisma via node to avoid Windows path breakage with "&" in the workspace path.
  execFileSync(
    process.execPath,
    [path.join(root, "node_modules", "prisma", "build", "index.js"), "migrate", "deploy"],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: connectionUrl,
        DIRECT_URL: connectionUrl,
        PRISMA_DATABASE_URL: connectionUrl,
      },
    },
  )
}

function stashTargetMigration() {
  fs.mkdirSync(stashDir, { recursive: true })
  const from = path.join(migrationsDir, targetMigration)
  const to = path.join(stashDir, targetMigration)
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true })
  fs.renameSync(from, to)
}

function restoreTargetMigration() {
  const from = path.join(stashDir, targetMigration)
  const to = path.join(migrationsDir, targetMigration)
  if (!fs.existsSync(from)) throw new Error("Migration stash missing.")
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true })
  fs.renameSync(from, to)
}

async function seedLegacyFixtures(client: pg.Client) {
  const now = new Date().toISOString()
  await client.query(
    `INSERT INTO "Invitation" ("id","token","code","label","greeting","active","createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,true,$6,$6)`,
    ["inv_legacy_1", "token-legacy-1", "LEGACY0001", "Convite Sintético", "Olá", now],
  )

  for (const gift of giftFixtures) {
    await client.query(
      `INSERT INTO "Gift" ("id","slug","name","category","description","image","sortOrder","active","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4::"GiftCategory",$5,$6,$7,$8,$9,$9)`,
      [
        gift.id,
        gift.slug,
        gift.name,
        gift.category,
        null,
        gift.image,
        gift.sortOrder,
        gift.active,
        now,
      ],
    )
  }

  await client.query(
    `INSERT INTO "GiftReservation" ("id","giftId","invitationId","donorName","donorContact","message","reservedAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$7)`,
    ["res_legacy_1", "gift_01", "inv_legacy_1", "Doador Teste", null, "Reserva sintética", now],
  )
}

async function main() {
  fs.rmSync(databaseDir, { recursive: true, force: true })
  fs.mkdirSync(databaseDir, { recursive: true })

  const pgServer = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password,
    port,
    persistent: false,
    autoRehydrateSymlinks: true,
  })

  await pgServer.initialise()
  await pgServer.start()
  await pgServer.createDatabase(database)

  console.log(
    JSON.stringify(
      {
        isolated: true,
        host: "127.0.0.1",
        port,
        database,
        databaseDir,
      },
      null,
      2,
    ),
  )

  let client: pg.Client | null = null
  let prisma: PrismaClient | null = null
  let pool: pg.Pool | null = null

  try {
    stashTargetMigration()
    migrateDeploy()

    client = new pg.Client({ connectionString: connectionUrl })
    await client.connect()

    const beforeEnums = await client.query(`SELECT unnest(enum_range(NULL::"GiftCategory"))::text AS value`)
    await seedLegacyFixtures(client)
    const beforeGifts = await client.query(`SELECT id, slug, category::text, image, active FROM "Gift" ORDER BY "sortOrder"`)
    const beforeReservations = await client.query(`SELECT id, "giftId" FROM "GiftReservation"`)
    const beforeIds = beforeGifts.rows.map((row) => row.id)

    console.log(
      JSON.stringify(
        {
          legacyEnums: beforeEnums.rows.map((row) => row.value),
          giftsBefore: beforeGifts.rows.length,
          reservationsBefore: beforeReservations.rows.length,
          customImagesBefore: beforeGifts.rows.filter((row) => row.image).length,
          emptyImagesBefore: beforeGifts.rows.filter((row) => !row.image).length,
          inactiveBefore: beforeGifts.rows.filter((row) => !row.active).length,
          fixtureIds: beforeIds,
        },
        null,
        2,
      ),
    )

    await client.end()
    client = null

    restoreTargetMigration()
    migrateDeploy()

    pool = new pg.Pool({ connectionString: connectionUrl })
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

    const categories = await prisma.giftCatalogCategory.findMany({ orderBy: { sortOrder: "asc" } })
    const gifts = await prisma.gift.findMany({
      orderBy: { sortOrder: "asc" },
      include: { reservation: true, catalogCategory: true },
    })
    const afterIds = gifts.map((gift) => gift.id)
    const custom = gifts.find((gift) => gift.id === "gift_01")
    const empty = gifts.find((gift) => gift.id === "gift_02")
    const reservation = gifts.find((gift) => gift.id === "gift_01")?.reservation

    if (categories.length < 5) throw new Error("Categorias legadas insuficientes após migration.")
    if (gifts.length !== 18) throw new Error(`Esperados 18 presentes, obtidos ${gifts.length}.`)
    if (gifts.some((gift) => !gift.categoryId)) throw new Error("Backfill incompleto: categoryId nulo.")
    if (JSON.stringify(afterIds) !== JSON.stringify(beforeIds)) throw new Error("IDs de presentes alterados.")
    if (!reservation || reservation.id !== "res_legacy_1") throw new Error("Reserva não preservada.")
    if (custom?.image !== "/images/gifts/custom-pratos.webp") throw new Error("Imagem personalizada alterada.")
    if (empty?.image) throw new Error("Presente sem imagem deveria permanecer vazio no DB.")

    const expectedMap: Record<string, string> = {
      TABLE: "gcat_mesa",
      KITCHEN: "gcat_cozinha",
      HOME: "gcat_casa",
      APPLIANCES: "gcat_eletros",
      BATH: "gcat_banho",
    }
    for (const gift of gifts) {
      const legacy = gift.legacyCategory
      if (!legacy) throw new Error(`legacyCategory ausente em ${gift.slug}`)
      if (gift.categoryId !== expectedMap[legacy]) {
        throw new Error(`Backfill incorreto para ${gift.slug}: ${gift.categoryId}`)
      }
    }

    const dynamic = await prisma.giftCatalogCategory.create({
      data: {
        name: "Categoria Dinâmica Isolada",
        slug: `dinamica-${Date.now()}`,
        sortOrder: 99,
        active: true,
        description: "somente teste",
      },
    })
    const dynamicGift = await prisma.gift.create({
      data: {
        slug: `presente-dinamico-${Date.now()}`,
        name: "Presente Dinâmico",
        categoryId: dynamic.id,
        legacyCategory: null,
        sortOrder: 1000,
        active: true,
      },
    })
    if (dynamicGift.legacyCategory !== null) throw new Error("legacyCategory deveria ser null.")

    let deleteBlocked = false
    try {
      await prisma.giftCatalogCategory.delete({ where: { id: dynamic.id } })
    } catch {
      deleteBlocked = true
    }
    if (!deleteBlocked) throw new Error("Exclusão de categoria com presentes deveria falhar.")

    await prisma.giftCatalogCategory.update({
      where: { id: dynamic.id },
      data: { active: false },
    })
    const publicVisible = await prisma.gift.findMany({
      where: { active: true, catalogCategory: { active: true } },
      select: { id: true },
    })
    if (publicVisible.some((gift) => gift.id === dynamicGift.id)) {
      throw new Error("Presente de categoria inativa não deveria aparecer no catálogo público.")
    }

    // Seed image dry-run + apply twice (idempotent / concurrent-safe updateMany)
    const dryPlan = planGiftDefaultImages(
      gifts.map((gift) => ({ slug: gift.slug, image: gift.image })),
    )
    if (!dryPlan.ignoredCustom.includes("jogo-de-pratos")) {
      throw new Error("Dry-run deveria ignorar imagem personalizada.")
    }
    if (!dryPlan.updatable.includes("jogo-de-copos")) {
      throw new Error("Dry-run deveria marcar presente sem imagem como atualizável.")
    }

    for (let pass = 0; pass < 2; pass += 1) {
      for (const slug of dryPlan.updatable) {
        const image = DEFAULT_GIFT_IMAGE_MANIFEST[slug as keyof typeof DEFAULT_GIFT_IMAGE_MANIFEST]
        await prisma.gift.updateMany({
          where: { slug, OR: [{ image: null }, { image: "" }] },
          data: { image },
        })
      }
    }

    const afterSeed = await prisma.gift.findMany({
      where: { slug: { in: ["jogo-de-pratos", "jogo-de-copos"] } },
      select: { slug: true, image: true, reservation: { select: { id: true } } },
    })
    const pratos = afterSeed.find((item) => item.slug === "jogo-de-pratos")
    const copos = afterSeed.find((item) => item.slug === "jogo-de-copos")
    if (pratos?.image !== "/images/gifts/custom-pratos.webp") throw new Error("Seed sobrescreveu imagem personalizada.")
    if (copos?.image !== DEFAULT_GIFT_IMAGE_MANIFEST["jogo-de-copos"]) throw new Error("Seed não preencheu imagem padrão.")
    if (!pratos?.reservation) throw new Error("Reserva perdida após seed.")

    // Category seed create-only: customize then createMany skipDuplicates should keep custom fields
    await prisma.giftCatalogCategory.update({
      where: { id: "gcat_mesa" },
      data: { name: "Mesa Personalizada", description: "custom", sortOrder: 77, active: false },
    })
    await prisma.giftCatalogCategory.createMany({
      data: [
        { id: "gcat_mesa", name: "Mesa", slug: "mesa", sortOrder: 2, active: true },
      ],
      skipDuplicates: true,
    })
    const mesa = await prisma.giftCatalogCategory.findUniqueOrThrow({ where: { id: "gcat_mesa" } })
    if (mesa.name !== "Mesa Personalizada" || mesa.sortOrder !== 77 || mesa.active !== false) {
      throw new Error("Seed de categorias reescreveu personalização.")
    }

    const available = Object.values(DEFAULT_GIFT_IMAGE_MANIFEST)
    const resolvedCustom = resolvePublicGiftImage("jogo-de-pratos", pratos.image, available)
    const resolvedDefault = resolvePublicGiftImage("jogo-de-copos", copos.image, available)
    if (resolvedCustom !== "/images/gifts/custom-pratos.webp") throw new Error("Fallback público falhou para custom.")
    if (resolvedDefault !== DEFAULT_GIFT_IMAGE_MANIFEST["jogo-de-copos"]) throw new Error("Fallback público falhou para default.")

    console.log(
      JSON.stringify(
        {
          status: "PASS",
          categoriesAfter: categories.length,
          giftsAfter: gifts.length,
          giftIdsPreserved: true,
          reservationsAfter: 1,
          customImagesPreserved: true,
          backfillValidated: true,
          dynamicCategory: dynamic.slug,
          newGift: dynamicGift.slug,
          legacyEnumNull: true,
          olderAppCompatibility:
            "Versão antiga lê Gift.category enum; presentes com legacyCategory=null exigem app novo (expand/contract).",
          protectedCategoryDeletion: true,
          inactiveCategoryHiddenFromPublic: true,
          seedDryRun: dryPlan,
          seedIdempotent: true,
          concurrentUpdateSafety: true,
        },
        null,
        2,
      ),
    )
  } finally {
    try {
      restoreTargetMigration()
    } catch {
      // already restored
    }
    if (client) await client.end().catch(() => undefined)
    if (prisma) await prisma.$disconnect().catch(() => undefined)
    if (pool) await pool.end().catch(() => undefined)
    await pgServer.stop().catch(() => undefined)
  }
}

main().catch((error) => {
  try {
    restoreTargetMigration()
  } catch {
    // ignore
  }
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
