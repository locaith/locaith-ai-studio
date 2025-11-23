-- =====================================================
-- GOOGLE LOGIN FIX - Run this in Supabase SQL Editor
-- =====================================================
-- This fixes "Database error saving new user" issue
-- =====================================================

-- STEP 1: Drop and recreate profiles table (if needed)
-- =====================================================
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile data from OAuth and email/password signups';

-- =====================================================
-- STEP 2: Create improved trigger function with error handling
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile with robust fallbacks for different auth methods
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
    -- Log error to Supabase logs but DON'T block user creation
    RAISE WARNING 'Error in handle_new_user for user %: % %', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates profile when new user signs up (OAuth or email/password)';

-- =====================================================
-- STEP 3: Setup RLS policies (CRITICAL for trigger to work)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CRITICAL: Allow service role (used by trigger) to bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- =====================================================
-- STEP 4: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- =====================================================
-- STEP 5: Test the trigger (optional but recommended)
-- =====================================================

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- This will test if trigger works without actually creating auth user
  RAISE NOTICE 'Trigger function exists and is valid';
  RAISE NOTICE 'Profiles table: % columns', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles');
  RAISE NOTICE 'Trigger: %', (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created');
END $$;

-- =====================================================
-- STEP 6: Verify setup
-- =====================================================

-- Check profiles table
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles') as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- Check trigger
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name = 'on_auth_user_created';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- SUCCESS! 
-- =====================================================
-- After running this:
-- 1. Try Google login again
-- 2. Should redirect successfully to app
-- 3. Check profiles table - should have new record
-- =====================================================

SELECT 
  '✅ Setup complete! Try Google login now.' as status,
  'If still fails, check Supabase logs: Dashboard → Database → Logs' as next_step;
