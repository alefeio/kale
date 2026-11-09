/**
 * ADMIN-P3 DB-GATE — apply invitation visit migration on isolated PostgreSQL only.
 * Resolves embedded-postgres from local node_modules or optional nearby installs.
 */
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { createRequire } from "node:module"
import pg from "pg"

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const databaseDir = path.join(root, ".tmp", "kale-visit-pg")
const port = 55435
const password = "kale_visit_pw"
const database = "kale_visit_gate"
const connectionUrl = `postgresql://postgres:${password}@127.0.0.1:${port}/${database}`
const targetMigration = "20261109120000_add_invitation_visits"

async function loadEmbeddedPostgres() {
  const candidates = [
    path.join(root, "node_modules", "embedded-postgres", "dist", "index.js"),
    path.join(root, "..", "pg-tools", "node_modules", "embedded-postgres", "dist", "index.js"),
    "D:/tmp/pg-tools/node_modules/embedded-postgres/dist/index.js",
  ]
  for (const candidate of candidates) {
    if (candidate.endsWith(".js") && fs.existsSync(candidate)) {
      const mod = await import(pathToFileURL(candidate).href)
      return mod.default
    }
  }
  try {
    // Optional dependency — may be absent in CI; prefer explicit paths above.
    return require("embedded-postgres").default
  } catch {
    throw new Error(
      "embedded-postgres not found. Install it locally or place it under node_modules/embedded-postgres.",
    )
  }
}

function migrateDeploy() {
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

async function main() {
  const Embedded = await loadEmbeddedPostgres()
  fs.rmSync(databaseDir, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(databaseDir), { recursive: true })

  const pgServer = new Embedded({
    databaseDir,
    user: "postgres",
    password,
    port,
    persistent: false,
    autoRehydrateSymlinks: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
  })

  await pgServer.initialise()
  await pgServer.start()
  await pgServer.createDatabase(database)

  try {
    migrateDeploy()
    const client = new pg.Client({ connectionString: connectionUrl })
    await client.connect()
    try {
      const now = new Date().toISOString()
      await client.query(
        `INSERT INTO "Invitation" ("id","token","code","label","greeting","active","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,true,$6,$6), ($7,$8,$9,$10,$11,true,$6,$6)`,
        [
          "inv_a",
          "token-visit-a",
          "VISITA0001",
          "Convite A",
          "Olá",
          now,
          "inv_b",
          "token-visit-b",
          "VISITA0002",
          "Convite B",
          "Olá",
        ],
      )
      await client.query(
        `INSERT INTO "Guest" ("id","invitationId","name","attending","sortOrder","createdAt","updatedAt")
         VALUES ('guest_a1','inv_a','Ana',true,0,$1,$1), ('guest_b1','inv_b','Bruno',null,0,$1,$1)`,
        [now],
      )
      await client.query(
        `INSERT INTO "RsvpResponse" ("id","invitationId","note","respondedAt","updatedAt")
         VALUES ('rsvp_a','inv_a','ok',$1,$1)`,
        [now],
      )

      const beforeTokens = await client.query(`select id, token, code from "Invitation" order by id`)
      const beforeRsvp = await client.query(`select id, "invitationId", note from "RsvpResponse" order by id`)

      await client.query(
        `INSERT INTO "InvitationVisit" ("id","invitationId","visitedAt","eventKey")
         VALUES
          ('v1','inv_a',$1,'inv_a:key-1'),
          ('v2','inv_a',$2,'inv_a:key-2'),
          ('v3','inv_b',$3,'inv_b:key-1')`,
        ["2026-11-01T12:00:00.000Z", "2026-11-08T18:00:00.000Z", "2026-11-05T10:00:00.000Z"],
      )

      const afterTokens = await client.query(`select id, token, code from "Invitation" order by id`)
      const afterRsvp = await client.query(`select id, "invitationId", note from "RsvpResponse" order by id`)
      const visits = await client.query(
        `select id, "invitationId", "eventKey" from "InvitationVisit" order by id`,
      )
      const table = await client.query(`select to_regclass('public."InvitationVisit"') is not null as present`)
      const indexes = await client.query(
        `select indexname from pg_indexes where tablename='InvitationVisit' order by 1`,
      )
      const fk = await client.query(
        `select confdeltype from pg_constraint where conname='InvitationVisit_invitationId_fkey'`,
      )
      const mig = await client.query(
        `select migration_name from _prisma_migrations where migration_name=$1`,
        [targetMigration],
      )
      const invented = await client.query(`select count(*)::int as c from "InvitationVisit" where id like 'retro%'`)

      const result = {
        status: "PASS",
        tablePresent: table.rows[0].present,
        migrationApplied: mig.rowCount === 1,
        tokensUnchanged: JSON.stringify(beforeTokens.rows) === JSON.stringify(afterTokens.rows),
        rsvpUnchanged: JSON.stringify(beforeRsvp.rows) === JSON.stringify(afterRsvp.rows),
        visitsLinked: visits.rows.every((row) => String(row.eventKey).startsWith(String(row.invitationId) + ":")),
        visitCount: visits.rowCount,
        noRetroactiveInvention: invented.rows[0].c === 0,
        indexes: indexes.rows.map((r) => r.indexname),
        cascadeDelete: fk.rows[0]?.confdeltype === "c",
        databaseDir,
      }

      const ok =
        result.tablePresent &&
        result.migrationApplied &&
        result.tokensUnchanged &&
        result.rsvpUnchanged &&
        result.visitsLinked &&
        result.noRetroactiveInvention &&
        result.cascadeDelete

      if (!ok) result.status = "FAIL"
      console.log(JSON.stringify(result, null, 2))
      if (!ok) process.exit(1)
    } finally {
      await client.end()
    }
  } finally {
    try {
      await Promise.race([
        pgServer.stop(),
        new Promise((resolve) => setTimeout(resolve, 5_000)),
      ])
    } catch {
      // Windows embedded stop can hang; assertions already finished.
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
