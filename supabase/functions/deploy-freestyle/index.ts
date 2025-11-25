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
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Verify user authentication
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Parse request body
        const { project_name, html_content, website_id } = await req.json()

        if (!project_name || !html_content) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: project_name, html_content' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Generate subdomain (sanitize project name)
        const subdomain = project_name
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 63) // DNS label max length

        const timestamp = Date.now().toString(36)
        const uniqueSubdomain = `${subdomain}-${timestamp}`

        console.log(`Deploying to Freestyle.sh: ${uniqueSubdomain}`)

        // Create Freestyle.sh sandbox
        const freestyleApiKey = Deno.env.get('FREESTYLE_API_KEY')
        if (!freestyleApiKey) {
            throw new Error('FREESTYLE_API_KEY not configured in environment')
        }

        // Create sandbox via Freestyle API
        const sandboxResponse = await fetch('https://api.freestyle.sh/v1/sandboxes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${freestyleApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: uniqueSubdomain,
                template: 'html',
                files: {
                    'index.html': html_content
                }
            })
        })

        if (!sandboxResponse.ok) {
            const errorText = await sandboxResponse.text()
            console.error('Freestyle API error:', errorText)
            throw new Error(`Freestyle deployment failed: ${errorText}`)
        }

        const sandboxData = await sandboxResponse.json()
        const sandboxUrl = sandboxData.url || `https://${uniqueSubdomain}.freestyle.sh`

        console.log(`Deployed to: ${sandboxUrl}`)

        // Update or insert website record
        const websiteData = {
            user_id: user.id,
            project_name,
            subdomain: uniqueSubdomain,
            html_content,
            status: 'active',
            is_public: true,
            updated_at: new Date().toISOString(),
        }

        let dbData, dbError
        if (website_id) {
            // Update existing
            ({ data: dbData, error: dbError } = await supabaseClient
                .from('websites')
                .update(websiteData)
                .eq('id', website_id)
                .select()
                .single())
        } else {
            // Create new
            ({ data: dbData, error: dbError } = await supabaseClient
                .from('websites')
                .insert([websiteData])
                .select()
                .single())
        }

        if (dbError) {
            console.error('Database error:', dbError)
            // Non-blocking - deployment succeeded but DB save failed
        }

        // Create deployment record
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

        // Log activity
        await supabaseClient
            .from('user_activity')
            .insert({
                user_id: user.id,
                feature_type: 'web-builder',
                action_type: 'deploy',
                action_details: {
                    project_name,
                    subdomain: uniqueSubdomain,
                    provider: 'freestyle',
                    url: sandboxUrl,
                },
            })

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                url: sandboxUrl,
                subdomain: uniqueSubdomain,
                website_id: dbData?.id,
                sandbox_id: sandboxData.id,
                message: 'Website deployed successfully to Freestyle.sh!',
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )

    } catch (error: any) {
        console.error('Deployment error:', error)
        return new Response(
            JSON.stringify({
                error: 'Deployment failed',
                message: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
