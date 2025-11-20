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

async function run() {
  loadEnv()
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const supabase = createClient(url, serviceKey)
  let page = 1
  let totalDeleted = 0
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) {
      console.error('List users failed:', error.message)
      process.exit(1)
    }
    const users = data?.users || []
    if (users.length === 0) break
    for (const u of users) {
      try {
        await supabase.auth.admin.deleteUser(u.id)
        totalDeleted++
      } catch (e) {
        console.warn('Failed to delete user', u.id)
      }
    }
    page++
  }
  console.log(`Deleted ${totalDeleted} users from Supabase Auth.`)
}

run().catch(err => { console.error(err); process.exit(1) })