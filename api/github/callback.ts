import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const code = (req.query.code as string) || ''
  const state = (req.query.state as string) || ''
  const cookies = (req.headers.cookie || '').split(';').map(s => s.trim())
  const savedState = cookies.find(c => c.startsWith('gh_oauth_state='))?.split('=')[1]
  if (!clientId || !clientSecret || !code || !state || !savedState || savedState !== state) {
    res.status(400).send('Invalid request')
    return
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = req.headers['host'] as string
  const origin = `${proto}://${host}`
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: `${origin}/api/github/callback` })
  })
  if (!tokenRes.ok) {
    res.status(500).send('Token exchange failed')
    return
  }
  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"></head><body><script>
    (function(){
      var data = { type: 'github-auth-success', access_token: '${accessToken}' };
      try { window.opener && window.opener.postMessage(data, '${origin}'); } catch(e){}
      window.close();
    })();
  </script></body></html>`)
}