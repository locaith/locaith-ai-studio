// =====================================================
// SUPABASE EDGE FUNCTION: deploy-vercel
// =====================================================
// Deploy website to Vercel with custom subdomain
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
        console.log('Vercel deploy request received')

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Authenticate user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            console.error('Auth error:', userError)
            return new Response(JSON.stringify({
                error: 'Unauthorized',
                details: userError?.message || 'No user found'
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

        // Get Vercel API token from environment
        const vercelToken = Deno.env.get('VERCEL_API_TOKEN')
        if (!vercelToken) {
            console.error('VERCEL_API_TOKEN not configured')
            return new Response(JSON.stringify({ error: 'Deployment service not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Sanitize project name
        const sanitizedName = project_name
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 63)

        console.log('Deploying to Vercel:', sanitizedName)

        // Create deployment package
        const deploymentConfig = {
            name: sanitizedName,
            files: [
                {
                    file: 'index.html',
                    data: html_content
                }
            ],
            projectSettings: {
                framework: null
            }
        }

        // Deploy to Vercel
        const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deploymentConfig)
        })

        if (!vercelResponse.ok) {
            const errorData = await vercelResponse.json()
            console.error('Vercel API error:', errorData)
            return new Response(JSON.stringify({
                error: 'Vercel deployment failed',
                details: errorData.error?.message || vercelResponse.statusText
            }), {
                status: vercelResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const deployment = await vercelResponse.json()
        console.log('Deployment successful:', deployment.url)

        const deploymentUrl = `https://${deployment.url}`

        // Update website record in database
        if (website_id) {
            const { error: updateError } = await supabaseClient
                .from('websites')
                .update({
                    subdomain: deployment.url,
                    status: 'published',
                    updated_at: new Date().toISOString()
                })
                .eq('id', website_id)

            if (updateError) {
                console.error('Failed to update website record:', updateError)
            }

            // Log deployment activity
            await supabaseClient
                .from('user_activity')
                .insert({
                    user_id: user.id,
                    feature_type: 'web-builder',
                    action_type: 'deploy',
                    action_details: {
                        website_id,
                        url: deploymentUrl,
                        project_name: sanitizedName
                    }
                })
        }

        return new Response(JSON.stringify({
            success: true,
            url: deploymentUrl,
            domain: deployment.url,
            message: 'Website deployed successfully!'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Deployment error:', error)
        return new Response(JSON.stringify({
            error: 'Internal server error',
            details: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
