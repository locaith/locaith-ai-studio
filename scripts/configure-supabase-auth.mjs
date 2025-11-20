import 'dotenv/config'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

function getProjectRefFromUrl(url) {
  try {
    const u = new URL(url)
    const host = u.hostname
    return host.split('.')[0]
  } catch {
    return null
  }
}

async function run() {
  const root = path.resolve('.')
  const localEnvPath = path.join(root, '.env.local')
  if (fs.existsSync(localEnvPath)) dotenv.config({ path: localEnvPath })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const projectRef = getProjectRefFromUrl(supabaseUrl || '')
  const pat = process.env.SUPABASE_PAT

  if (!projectRef || !pat) {
    console.error('Missing SUPABASE_PAT or project ref')
    process.exit(1)
  }

  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`

  const additional = [
    'https://locaith.ai/auth/callback',
    'https://www.locaith.ai/auth/callback',
    'http://localhost:3001/auth/callback',
    'http://localhost:3000/auth/callback',
    'http://localhost:4173/auth/callback',
    'http://localhost:5173/auth/callback',
    'http://localhost:5173',
    // root origins for implicit redirects
    'https://locaith.ai',
    'https://www.locaith.ai',
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173'
  ]

  const body = {
    site_url: 'https://locaith.ai',
    additional_redirect_urls: additional
  }

  const res = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Failed to configure auth:', res.status, text)
    process.exit(1)
  }

  console.log('Supabase auth configuration updated.')
}

run().catch(err => { console.error(err); process.exit(1) })