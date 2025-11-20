import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    res.status(500).send('Missing GitHub client id')
    return
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = req.headers['host'] as string
  const redirectUri = `${proto}://${host}/api/github/callback`
  const scope = 'repo'
  const state = crypto.randomUUID()
  res.setHeader('Set-Cookie', `gh_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax`)
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`
  res.status(302).setHeader('Location', url)
  res.end()
}