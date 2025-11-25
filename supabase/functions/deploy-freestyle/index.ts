// =====================================================
// SUPABASE EDGE FUNCTION: deploy-freestyle
// =====================================================
// Deploy website to Freestyle.sh sandbox and return live URL
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log request for debugging
    console.log('Deploy request received from:', req.headers.get('Authorization')?.substring(0, 20) + '...')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', {
        error: userError,
        hasAuthHeader: !!req.headers.get('Authorization'),
        headerLength: req.headers.get('Authorization')?.length
      })

      return new Response(JSON.stringify({
        error: 'Unauthorized',
        details: userError?.message || 'No user found',
        hint: 'Make sure you are logged in and the session is valid'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Authenticated user:', user.email)

    const { project_name, html_content, website_id } = await req.json()
    if (!project_name || !html_content) {
      return new Response(JSON.stringify({ error: 'Missing required fields: project_name, html_content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subdomain = project_name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 63)

    const timestamp = Date.now().toString(36)
    const uniqueSubdomain = `${subdomain}-${timestamp}`

    const freestyleApiKey = Deno.env.get('FREESTYLE_API_KEY')
    if (!freestyleApiKey) {
      return new Response(JSON.stringify({ error: 'Deployment failed', message: 'FREESTYLE_API_KEY not configured', code: 'env_missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sandboxResponse = await fetch('https://api.freestyle.sh/v1/sandboxes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${freestyleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: uniqueSubdomain,
        template: 'html',
        files: { 'index.html': html_content },
      }),
    })

    if (!sandboxResponse.ok) {
      const errorText = await sandboxResponse.text()
      const unauthorized = /unauthorized/i.test(errorText)
      const status = unauthorized ? 401 : 502
      return new Response(JSON.stringify({ error: unauthorized ? 'Unauthorized' : 'Upstream deployment failed', provider: 'freestyle', details: errorText }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sandboxData = await sandboxResponse.json()
    const sandboxUrl = sandboxData.url || `https://${uniqueSubdomain}.freestyle.sh`

    const baseDomain = Deno.env.get('FREESTYLE_BASE_DOMAIN') ?? 'apps.locaith.ai'
    const customDomain = `${uniqueSubdomain}.${baseDomain}`

    const mapResponse = await fetch('https://api.freestyle.sh/v1/domain-mappings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${freestyleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain: customDomain, deploymentId: sandboxData.id, deployment_id: sandboxData.id }),
    })
    if (!mapResponse.ok) {
      const mapError = await mapResponse.text()
      console.error('Domain mapping error:', mapError)
      // Proceed without failing deployment; just omit custom domain
    }

    const websiteData = {
      user_id: user.id,
      project_name,
      subdomain: customDomain,
      html_content,
      status: 'active',
      is_public: true,
      updated_at: new Date().toISOString(),
    }

    let dbData, dbError
    if (website_id) {
      ({ data: dbData, error: dbError } = await supabaseClient
        .from('websites')
        .update(websiteData)
        .eq('id', website_id)
        .select()
        .single())
    } else {
      ({ data: dbData, error: dbError } = await supabaseClient
        .from('websites')
        .insert([websiteData])
        .select()
        .single())
    }

    if (dbError) {
      console.error('Database error:', dbError)
    }

    if (dbData) {
      await supabaseClient
        .from('deployments')
        .insert({
          website_id: dbData.id,
          version: 1,
          html_snapshot: html_content,
          deployed_by: user.id,
          deployment_log: {
            status: 'success',
            provider: 'freestyle',
            sandbox_id: sandboxData.id,
            timestamp: new Date().toISOString(),
          },
        })
    }

    await supabaseClient
      .from('user_activity')
      .insert({
        user_id: user.id,
        feature_type: 'web-builder',
        action_type: 'deploy',
        action_details: { project_name, subdomain: uniqueSubdomain, provider: 'freestyle', url: sandboxUrl },
      })

    return new Response(JSON.stringify({ success: true, url: sandboxUrl, custom_url: `https://${customDomain}`, subdomain: uniqueSubdomain, website_id: dbData?.id, sandbox_id: sandboxData.id, message: 'Website deployed successfully to Freestyle.sh!' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    const msg = String(error?.message || 'Unknown error')
    return new Response(JSON.stringify({ error: 'Deployment failed', message: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
