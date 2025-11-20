import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleAuth } from 'google-auth-library'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { text, voiceName, speakingRate } = req.body || {}
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Missing text' })
      return
    }

    const payload = {
      input: { text },
      voice: {
        languageCode: (voiceName && voiceName.split('-').slice(0, 2).join('-')) || 'en-US',
        name: voiceName || 'en-US-Neural2-F',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: typeof speakingRate === 'number' ? speakingRate : 1.0,
      },
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY

    if (apiKey) {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await resp.json()
      if (!resp.ok) {
        res.status(resp.status).json({ error: data.error || 'TTS error' })
        return
      }
      res.status(200).json({ audioContent: data.audioContent, contentType: 'audio/mpeg' })
      return
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    if (!clientEmail || !privateKey) {
      res.status(500).json({ error: 'Missing Google TTS credentials' })
      return
    }

    const auth = new GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    const client = await auth.getClient()
    const url = 'https://texttospeech.googleapis.com/v1/text:synthesize'
    const resp = await (client as any).request({ url, method: 'POST', data: payload })
    const data = resp.data
    res.status(200).json({ audioContent: data.audioContent, contentType: 'audio/mpeg' })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unexpected error' })
  }
}