import { SignJWT, importPKCS8 } from 'https://esm.sh/jose@4.14.4'

type TTSRequest = {
  text: string
  voiceName?: string
  speakingRate?: number
}

const buildPayload = (payload: TTSRequest) => {
  return {
    input: { text: payload.text },
    voice: {
      languageCode: (payload.voiceName?.split('-').slice(0, 2).join('-')) || 'en-US',
      name: payload.voiceName || 'en-US-Neural2-F'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: typeof payload.speakingRate === 'number' ? payload.speakingRate : 1.0
    }
  }
}

const getAccessTokenFromServiceAccount = async (): Promise<string | null> => {
  try {
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')
    const privateKeyRaw = Deno.env.get('GOOGLE_PRIVATE_KEY')
    if (!clientEmail || !privateKeyRaw) return null
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n')
    const key = await importPKCS8(privateKey, 'RS256')
    const jwt = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(clientEmail)
      .setAudience('https://oauth2.googleapis.com/token')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key)
    const form = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    })
    const tokenJson = await tokenResp.json()
    if (!tokenResp.ok) return null
    return tokenJson.access_token as string
  } catch (_e) {
    return null
  }
}

const synthesize = async (payload: TTSRequest) => {
  const body = buildPayload(payload)

  // Prefer service account if available
  const accessToken = await getAccessTokenFromServiceAccount()
  if (accessToken) {
    const resp = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body)
    })
    const data = await resp.json()
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data?.error || 'TTS error' }), { status: resp.status })
    }
    return new Response(JSON.stringify({ audioContent: data.audioContent, contentType: 'audio/mpeg' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Fallback to API Key if no service account
  const apiKey = Deno.env.get('GOOGLE_TTS_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Google credentials' }), { status: 500 })
  }
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await resp.json()
  if (!resp.ok) {
    return new Response(JSON.stringify({ error: data?.error || 'TTS error' }), { status: resp.status })
  }
  return new Response(JSON.stringify({ audioContent: data.audioContent, contentType: 'audio/mpeg' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }
  try {
    const payload = await req.json() as TTSRequest
    if (!payload?.text) {
      return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400 })
    }
    return await synthesize(payload)
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 })
  }
})