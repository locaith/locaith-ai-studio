-- =====================================================
-- DIAGNOSTIC & CLEANUP - LOCAITH AI STUDIO
-- =====================================================
-- Run this to FIND and KILL any hidden triggers causing the error.
-- =====================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  -- 1. Log existing triggers for debugging
  RAISE NOTICE 'Scanning for triggers on auth.users...';
  
  FOR r IN (
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_schema = 'auth' 
    AND event_object_table = 'users'
  ) LOOP
    RAISE NOTICE 'Found trigger: %', r.trigger_name;
    
    -- 2. DYNAMICALLY DROP THE TRIGGER
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON auth.users CASCADE';
    RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
  END LOOP;
  
  RAISE NOTICE 'All triggers on auth.users have been removed.';
END $$;

-- 3. Verify no triggers remain
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- 4. Check if profiles table exists and is writable
SELECT table_name, is_insertable_into 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 5. Final Status
SELECT '✅ CLEANUP COMPLETE. Try logging in now.' as status;
