// =====================================================
// SUPABASE EDGE FUNCTION: github-auth
// =====================================================
// Exchanges GitHub OAuth code for an access token
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { code } = await req.json()

        if (!code) {
            throw new Error('Missing code parameter')
        }

        const clientId = Deno.env.get('GITHUB_CLIENT_ID')
        const clientSecret = Deno.env.get('GITHUB_CLIENT_SECRET')

        if (!clientId || !clientSecret) {
            throw new Error('Missing GitHub Client ID or Secret in Edge Function secrets')
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code
            })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error)
        }

        // Fetch user info to verify
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'User-Agent': 'Locaith-Studio'
            }
        })

        const userData = await userResponse.json()

        return new Response(
            JSON.stringify({
                access_token: tokenData.access_token,
                user: userData
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
