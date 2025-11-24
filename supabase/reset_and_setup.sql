-- =====================================================
-- SUPABASE RESET & SETUP - LOCAITH AI STUDIO
-- =====================================================
-- WARNING: THIS SCRIPT WILL DELETE ALL DATA IN PUBLIC TABLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. DROP EXISTING TABLES (Clean Slate)
-- =====================================================
DROP TABLE IF EXISTS public.deployments CASCADE;
DROP TABLE IF EXISTS public.websites CASCADE;
DROP TABLE IF EXISTS public.user_activity CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing triggers/functions to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);

-- 2. ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREATE TABLES
-- =====================================================

-- Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Table
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Websites Table
CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  html_content TEXT NOT NULL,
  storage_path TEXT,
  github_repo TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active',
  metadata JSONB
);

-- Deployments Table
CREATE TABLE public.deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  html_snapshot TEXT,
  deployment_log JSONB,
  deployed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- =====================================================

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Activity
CREATE POLICY "Users can view own activity" 
  ON public.user_activity FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" 
  ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Websites
CREATE POLICY "Public websites are viewable by everyone" 
  ON public.websites FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own websites" 
  ON public.websites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites" 
  ON public.websites FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites" 
  ON public.websites FOR DELETE USING (auth.uid() = user_id);

-- Deployments
CREATE POLICY "Users can view deployments of their websites" 
  ON public.deployments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.websites WHERE websites.id = deployments.website_id AND websites.user_id = auth.uid())
  );

CREATE POLICY "Users can insert deployments for their websites" 
  ON public.deployments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.websites WHERE websites.id = deployments.website_id AND websites.user_id = auth.uid())
  );

-- 6. AUTOMATION (Triggers & Functions)
-- =====================================================

-- Function to handle new user registration (Google Auth or Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions to the function (important for security definer)
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 7. HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_websites', (SELECT COUNT(*) FROM public.websites WHERE user_id = user_uuid AND status = 'active'),
    'total_deployments', (SELECT COUNT(*) FROM public.deployments d JOIN public.websites w ON d.website_id = w.id WHERE w.user_id = user_uuid),
    'total_activities', (SELECT COUNT(*) FROM public.user_activity WHERE user_id = user_uuid),
    'last_activity_at', (SELECT MAX(created_at) FROM public.user_activity WHERE user_id = user_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT '✅ Database Reset & Setup Complete' as status;
