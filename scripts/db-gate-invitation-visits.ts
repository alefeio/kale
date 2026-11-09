/**
 * ADMIN-P3 DB-GATE — apply invitation visit migration on isolated PostgreSQL only.
 */
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const databaseDir = path.join("D:/tmp", "kale-visit-pg")
const port = 55435
const password = "kale_visit_pw"
const database = "kale_visit_gate"
const connectionUrl = `postgresql://postgres:${password}@127.0.0.1:${port}/${database}`
const targetMigration = "20261109120000_add_invitation_visits"

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
  const mod = await import(pathToFileURL("D:/tmp/pg-tools/node_modules/embedded-postgres/dist/index.js").href)
  const Embedded = mod.default

  fs.rmSync(databaseDir, { recursive: true, force: true })
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
      const table = await client.query(`select to_regclass('public."InvitationVisit"') is not null as present`)
      const cols = await client.query(
        `select column_name from information_schema.columns where table_name='InvitationVisit' order by 1`,
      )
      const mig = await client.query(
        `select migration_name from _prisma_migrations where migration_name=$1`,
        [targetMigration],
      )
      const forbidden = cols.rows.some((c) =>
        /ip|user.?agent|geo|fingerprint|device/i.test(String(c.column_name)),
      )
      const result = {
        status: "PASS",
        tablePresent: table.rows[0].present,
        migrationApplied: mig.rowCount === 1,
        columns: cols.rows.map((c) => c.column_name),
        noTrackingPiiColumns: !forbidden,
      }
      if (!result.tablePresent || !result.migrationApplied || forbidden) {
        result.status = "FAIL"
        console.log(JSON.stringify(result, null, 2))
        process.exit(1)
      }
      console.log(JSON.stringify(result, null, 2))
    } finally {
      await client.end()
    }
  } finally {
    await pgServer.stop()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
