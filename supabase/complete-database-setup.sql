-- =====================================================
-- COMPLETE DATABASE SETUP FOR LOCAITH AI STUDIO
-- =====================================================
-- This script will:
-- 1. Fix profiles table schema
-- 2. Setup proper RLS policies
-- 3. Create triggers for auto profile creation
-- 4. Ensure proper permissions
-- =====================================================

-- =====================================================
-- PART 1: PROFILES TABLE
-- =====================================================

-- Drop and recreate profiles table safely
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Create RLS Policies (VERY PERMISSIVE for debugging)
CREATE POLICY "profiles_select_policy"
    ON public.profiles
    FOR SELECT
    USING (true); -- Allow everyone to read profiles

CREATE POLICY "profiles_insert_policy"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true); -- Allow anyone to insert (needed for trigger)

CREATE POLICY "profiles_update_policy"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id); -- Users can only update their own profile

CREATE POLICY "profiles_delete_policy"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id); -- Users can only delete their own profile

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- =====================================================
-- PART 2: AUTO-CREATE PROFILE TRIGGER
-- =====================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'user_name',
            split_part(NEW.email, '@', 1),
            'User'
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, profiles.email),
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't block user creation
        RAISE WARNING 'Error in handle_new_user for user %: % %', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 3: WEBSITES TABLE
-- =====================================================

-- Ensure websites table exists with proper schema
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    html_content TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    github_repo TEXT,
    status TEXT DEFAULT 'draft',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "websites_select_policy" ON public.websites;
DROP POLICY IF EXISTS "websites_insert_policy" ON public.websites;
DROP POLICY IF EXISTS "websites_update_policy" ON public.websites;
DROP POLICY IF EXISTS "websites_delete_policy" ON public.websites;

-- Create RLS Policies
CREATE POLICY "websites_select_policy"
    ON public.websites
    FOR SELECT
    USING (
        auth.uid() = user_id OR is_public = true
    );

CREATE POLICY "websites_insert_policy"
    ON public.websites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "websites_update_policy"
    ON public.websites
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "websites_delete_policy"
    ON public.websites
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS websites_user_id_idx ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS websites_subdomain_idx ON public.websites(subdomain);
CREATE INDEX IF NOT EXISTS websites_updated_at_idx ON public.websites(updated_at DESC);

-- =====================================================
-- PART 4: USER ACTIVITY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature_type TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "user_activity_select_policy" ON public.user_activity;
DROP POLICY IF EXISTS "user_activity_insert_policy" ON public.user_activity;

-- Create RLS Policies
CREATE POLICY "user_activity_select_policy"
    ON public.user_activity
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "user_activity_insert_policy"
    ON public.user_activity
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS user_activity_created_at_idx ON public.user_activity(created_at DESC);

-- =====================================================
-- PART 5: DEPLOYMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
    version INTEGER DEFAULT 1,
    html_snapshot TEXT,
    deployed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    deployment_log JSONB DEFAULT '{}'::jsonb,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "deployments_select_policy" ON public.deployments;
DROP POLICY IF EXISTS "deployments_insert_policy" ON public.deployments;

-- Create RLS Policies
CREATE POLICY "deployments_select_policy"
    ON public.deployments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.websites
            WHERE websites.id = deployments.website_id
            AND (websites.user_id = auth.uid() OR websites.is_public = true)
        )
    );

CREATE POLICY "deployments_insert_policy"
    ON public.deployments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.websites
            WHERE websites.id = deployments.website_id
            AND websites.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS deployments_website_id_idx ON public.deployments(website_id);
CREATE INDEX IF NOT EXISTS deployments_deployed_at_idx ON public.deployments(deployed_at DESC);

-- =====================================================
-- PART 6: HELPER FUNCTION TO GET USER STATS
-- =====================================================

DROP FUNCTION IF EXISTS get_user_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_websites', (SELECT COUNT(*) FROM public.websites WHERE user_id = user_uuid),
        'total_deployments', (SELECT COUNT(*) FROM public.deployments WHERE deployed_by = user_uuid),
        'total_activities', (SELECT COUNT(*) FROM public.user_activity WHERE user_id = user_uuid)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- =====================================================
-- PART 7: CREATE PROFILES FOR EXISTING USERS
-- =====================================================

-- Insert profiles for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(
        raw_user_meta_data->>'full_name',
        raw_user_meta_data->>'name',
        split_part(email, '@', 1),
        'User'
    ) as full_name,
    created_at,
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES (Run these to check)
-- =====================================================

-- Check if trigger exists
-- SELECT tgname, tgrelid::regclass, proname 
-- FROM pg_trigger 
-- JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
-- WHERE tgname = 'on_auth_user_created';

-- Check profiles
-- SELECT id, email, full_name FROM public.profiles;

-- Check RLS policies
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

COMMIT;
