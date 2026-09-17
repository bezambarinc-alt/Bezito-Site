// run-migration.js — apply a db/migrations file and record it in schema_migrations
//
// Usage: node --env-file=.env.local scripts/run-migration.js <number|filename>
//        node --env-file=.env.local scripts/run-migration.js --status
//        node --env-file=.env.local scripts/run-migration.js --all
//        node --env-file=.env.local scripts/run-migration.js 014 --force
//
// Examples:
//   node --env-file=.env.local scripts/run-migration.js 016
//   node --env-file=.env.local scripts/run-migration.js 016_leads_sku_intent.sql
//
// The --env-file flag is required: this project does not depend on dotenv.
//
// Every migration runs inside a single transaction together with its
// schema_migrations INSERT, so a failed migration leaves no ledger row and no
// half-applied DDL. Migrations already listed in the ledger are skipped unless
// --force is passed.
//
// Bootstrapping: if schema_migrations does not exist yet (it arrives with
// migration 017), the script applies the file anyway and warns that nothing was
// recorded. Run 017 first, then the one-time backfill in db/README.md.

const fs = require('node:fs')
const path = require('node:path')
const { Pool } = require('pg')

const MIGRATIONS_DIR = path.resolve(__dirname, '../db/migrations')

const args = process.argv.slice(2)
const force = args.includes('--force')
const status = args.includes('--status')
const all = args.includes('--all')
const target = args.find(a => !a.startsWith('--'))

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set. Run with: node --env-file=.env.local scripts/run-migration.js <number>')
  process.exit(1)
}

if (!status && !all && !target) {
  console.error('Usage: node --env-file=.env.local scripts/run-migration.js <number|filename>')
  console.error('       node --env-file=.env.local scripts/run-migration.js --status')
  console.error('       node --env-file=.env.local scripts/run-migration.js --all')
  process.exit(1)
}

// All migration filenames, sorted by their numeric prefix.
function allMigrations() {
  let files
  try {
    files = fs.readdirSync(MIGRATIONS_DIR)
  } catch (err) {
    console.error(`Cannot read ${MIGRATIONS_DIR}: ${err.message}`)
    process.exit(1)
  }
  return files.filter(f => f.endsWith('.sql')).sort()
}

// Accepts "016", "16", or "016_leads_sku_intent.sql". Exits on miss or ambiguity.
function resolveMigration(name) {
  const files = allMigrations()
  if (files.includes(name)) return name

  const prefix = String(name).replace(/\D/g, '').padStart(3, '0')
  const matches = files.filter(f => f.startsWith(prefix + '_'))

  if (matches.length === 0) {
    console.error(`No migration matching "${name}" in db/migrations/`)
    console.error('Available:', files.join(', '))
    process.exit(1)
  }
  if (matches.length > 1) {
    console.error(`Ambiguous: "${name}" matches ${matches.join(' and ')}`)
    console.error('Two migrations share a number. Renumber one before applying.')
    process.exit(1)
  }
  return matches[0]
}

async function ledgerExists(client) {
  const { rows } = await client.query(`SELECT to_regclass('public.schema_migrations') AS t`)
  return rows[0].t !== null
}

async function appliedSet(client) {
  if (!(await ledgerExists(client))) return null
  const { rows } = await client.query(`SELECT id FROM schema_migrations`)
  return new Set(rows.map(r => r.id))
}

// Apply one file. Returns 'applied' | 'skipped'.
async function apply(client, file, applied) {
  if (applied && applied.has(file) && !force) {
    console.log(`- ${file} already applied — skipping`)
    return 'skipped'
  }

  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')

  try {
    await client.query('BEGIN')
    await client.query(sql)
    // The ledger may have been created by the migration we just ran (017).
    if (await ledgerExists(client)) {
      await client.query(
        `INSERT INTO schema_migrations (id) VALUES ($1)
         ON CONFLICT (id) DO UPDATE SET applied_at = now()`,
        [file],
      )
    } else {
      console.warn(`  ! schema_migrations does not exist — ${file} applied but NOT recorded.`)
      console.warn('  ! Apply 017_schema_migrations.sql, then backfill (see db/README.md).')
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(`✗ ${file} failed — rolled back, nothing was applied`)
    console.error(`  ${err.message}`)
    if (err.position) console.error(`  at character ${err.position}`)
    throw err
  }

  console.log(`✓ ${file} applied`)
  return 'applied'
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    const applied = await appliedSet(client)

    if (applied === null && !status) {
      console.warn('! schema_migrations not found — this database predates the ledger.')
      console.warn('! Nothing can be skipped automatically until 017 is applied and backfilled.\n')
    }

    if (status) {
      const files = allMigrations()
      if (applied === null) {
        console.log('schema_migrations does not exist. Apply 017_schema_migrations.sql first.\n')
        files.forEach(f => console.log(`  ?  ${f}`))
      } else {
        files.forEach(f => console.log(`  ${applied.has(f) ? '✓' : ' '}  ${f}`))
        const pending = files.filter(f => !applied.has(f))
        console.log(`\n${files.length - pending.length} applied, ${pending.length} pending`)
        // A ledger row with no file on disk means a migration was deleted or renamed.
        const orphans = [...applied].filter(id => !files.includes(id))
        if (orphans.length) console.log(`! Recorded but missing from disk: ${orphans.join(', ')}`)
      }
      return
    }

    const files = all ? allMigrations() : [resolveMigration(target)]
    let count = 0
    for (const f of files) {
      if ((await apply(client, f, applied)) === 'applied') {
        count++
        if (applied) applied.add(f)
      }
    }
    console.log(`\n${count} migration${count === 1 ? '' : 's'} applied.`)
    if (count > 0) console.log('Remember to fold the change into db/schema.sql.')
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
