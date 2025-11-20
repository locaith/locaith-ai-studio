import 'dotenv/config'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

function getProjectRefFromUrl(url) {
  try {
    const u = new URL(url)
    const host = u.hostname // e.g. rhxgyhkvtyojzbrtliqn.supabase.co
    return host.split('.')[0]
  } catch {
    return null
  }
}

async function run() {
  // Relax TLS validation for Supabase Postgres
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  const root = path.resolve('.')
  const localEnvPath = path.join(root, '.env.local')
  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath })
  }
  const env = process.env
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  const projectRef = env.SUPABASE_ORG_ID ? getProjectRefFromUrl(supabaseUrl) : getProjectRefFromUrl(supabaseUrl)
  const dbPassword = env.SUPABASE_DB_PASSWORD

  if (!supabaseUrl || !projectRef || !dbPassword) {
    console.error('Missing Supabase env. Required: VITE_SUPABASE_URL or SUPABASE_URL, SUPABASE_DB_PASSWORD')
    process.exit(1)
  }

  const conn = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`

  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
  await client.connect()

  const dropStatements = [
    "DROP TABLE IF EXISTS user_sessions CASCADE;",
    "DROP TABLE IF EXISTS user_activity_history CASCADE;",
    "DROP TABLE IF EXISTS social_connections CASCADE;",
    "DROP TABLE IF EXISTS scheduled_posts CASCADE;",
    "DROP TABLE IF EXISTS user_preferences CASCADE;",
  ]

  console.log('Resetting database schema...')
  for (const sql of dropStatements) {
    try { await client.query(sql) } catch (e) { /* ignore */ }
  }

  try {
    await client.query("DELETE FROM storage.objects WHERE bucket_id = 'websites';")
  } catch {}
  try {
    await client.query("DELETE FROM storage.buckets WHERE id = 'websites';")
  } catch {}

  const migrationsDir = path.resolve('supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log('Applying migrations:', files)
  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(sqlPath, 'utf8')
    console.log('Running', file)
    const stmts = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(Boolean)
    for (const stmt of stmts) {
      try {
        await client.query(stmt)
      } catch (e) {
        // continue on benign errors
        const msg = String(e.message || e)
        if (
          msg.includes('already exists') ||
          msg.includes('must be owner') ||
          msg.includes('does not exist')
        ) {
          console.warn('Skipped stmt due to:', msg)
          continue
        }
        throw e
      }
    }
  }

  await client.end()
  console.log('Supabase database reset and migrations applied successfully.')
}

run().catch(err => {
  console.error('Reset script failed:', err)
  process.exit(1)
})