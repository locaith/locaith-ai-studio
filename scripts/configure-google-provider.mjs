import 'dotenv/config'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

function getProjectRefFromUrl(url) {
  try {
    const u = new URL(url)
    return u.hostname.split('.')[0]
  } catch { return null }
}

async function run() {
  const root = path.resolve('.')
  const localEnvPath = path.join(root, '.env.local')
  if (fs.existsSync(localEnvPath)) dotenv.config({ path: localEnvPath })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const projectRef = getProjectRefFromUrl(supabaseUrl || '')
  const pat = process.env.SUPABASE_PAT
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const additionalIds = (process.env.GOOGLE_ADDITIONAL_CLIENT_IDS || '').split(',').map(s => s.trim()).filter(Boolean)

  if (!projectRef || !pat || !clientId || !clientSecret) {
    console.error('Missing env GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, SUPABASE_PAT, SUPABASE_URL/VITE_SUPABASE_URL')
    process.exit(1)
  }

  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`
  const body = {
    external_google_enabled: true,
    external_google_client_id: clientId,
    external_google_secret: clientSecret,
    external_google_additional_client_ids: additionalIds.join(',') || undefined
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
    console.error('Failed to configure google provider:', res.status, text)
    process.exit(1)
  }
  console.log('Google provider configured successfully.')
}

run().catch(err => { console.error(err); process.exit(1) })