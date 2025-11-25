// =====================================================
// SUPABASE EDGE FUNCTION: deploy-website
// =====================================================
// Deploy website HTML to Supabase and assign subdomain
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
        const { project_name, html_content, github_repo } = await req.json()

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

        // Add timestamp nếu trùng
        const timestamp = Date.now().toString(36)
        const uniqueSubdomain = `${subdomain}-${timestamp}`

        console.log(`Deploying website: ${uniqueSubdomain}`)

        // Insert/Update website record
        const { data: websiteData, error: websiteError } = await supabaseClient
            .from('websites')
            .upsert({
                user_id: user.id,
                project_name,
                subdomain: uniqueSubdomain,
                html_content,
                github_repo: github_repo || null,
                updated_at: new Date().toISOString(),
                status: 'active',
                is_public: true,
            }, {
                onConflict: 'subdomain',
                ignoreDuplicates: false,
            })
            .select()
            .single()

        if (websiteError) {
            console.error('Database error:', websiteError)
            return new Response(
                JSON.stringify({ error: 'Failed to save website', details: websiteError.message }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Create deployment record (version history)
        const { data: deploymentData, error: deploymentError } = await supabaseClient
            .from('deployments')
            .insert({
                website_id: websiteData.id,
                version: 1, // TODO: Auto-increment based on existing versions
                html_snapshot: html_content,
                deployed_by: user.id,
                deployment_log: {
                    status: 'success',
                    timestamp: new Date().toISOString(),
                    user_agent: req.headers.get('user-agent'),
                },
            })
            .select()
            .single()

        if (deploymentError) {
            console.warn('Failed to create deployment record:', deploymentError)
            // Non-blocking error, continue
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
                    html_size: html_content.length,
                    github_repo,
                },
            })

        // Return success response
        const deployedUrl = `https://${uniqueSubdomain}.locaith.ai`

        return new Response(
            JSON.stringify({
                success: true,
                url: deployedUrl,
                subdomain: uniqueSubdomain,
                website_id: websiteData.id,
                deployment_id: deploymentData?.id,
                message: 'Website deployed successfully!',
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
                error: 'Internal server error',
                message: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
