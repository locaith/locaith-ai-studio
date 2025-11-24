-- =====================================================
-- DEBUG: DISABLE AUTH TRIGGER
-- =====================================================
-- Run this to check if the Trigger is the cause of the login failure.
-- =====================================================

-- 1. Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Verify
SELECT '✅ Trigger Removed. Try logging in now.' as status;
