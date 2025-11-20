import 'dotenv/config'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const root = path.resolve('.')
  const localEnvPath = path.join(root, '.env.local')
  if (fs.existsSync(localEnvPath)) dotenv.config({ path: localEnvPath })
}

async function checkTable(supabase, table) {
  try {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) return { table, ok: false, error: error.message }
    return { table, ok: true }
  } catch (e) {
    return { table, ok: false, error: String(e?.message || e) }
  }
}

async function run() {
  loadEnv()
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const supabase = createClient(url, serviceKey)

  const tables = [
    'user_sessions',
    'user_activity_history',
    'social_connections',
    'scheduled_posts',
    'user_preferences'
  ]

  console.log('Verifying Supabase tables...')
  const results = []
  for (const t of tables) results.push(await checkTable(supabase, t))
  results.forEach(r => console.log(`- ${r.table}: ${r.ok ? 'OK' : 'MISSING'}${r.error ? ' ('+r.error+')' : ''}`))

  console.log('Verifying storage buckets...')
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets()
  if (bErr) {
    console.log('- buckets: ERROR', bErr.message)
  } else {
    const names = (buckets || []).map(b => b.name)
    console.log('- buckets:', names)
    console.log(`- websites bucket present: ${names.includes('websites')}`)
  }
}

run().catch(err => { console.error(err); process.exit(1) })