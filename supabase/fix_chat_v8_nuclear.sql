-- FIX CHAT SYSTEM V8 (NUCLEAR OPTION)
-- Problem: Previous fixes failed because "hidden" or "renamed" policies are still active and causing recursion.
-- Solution: This script uses a dynamic loop to find AND DELETE ALL policies on the chat tables, regardless of their names.

-- === STEP 1: WIPE EVERYTHING CLEAN (NUCLEAR) ===
DO $$
DECLARE
    pol record;
BEGIN
    -- 1. Loop through ALL policies on 'messages', 'groups', and 'group_members'
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('messages', 'groups', 'group_members') 
    LOOP
        -- 2. Dynamically execute DROP POLICY for each one found
        RAISE NOTICE 'Dropping policy: % on table: %', pol.policyname, pol.tablename;
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Drop functions with CASCADE to ensure no dependencies remain
DROP FUNCTION IF EXISTS public.is_group_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v7(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v8(uuid) CASCADE;

-- === STEP 2: RE-ENABLE RLS (Just to be sure) ===
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- === STEP 3: CREATE THE "FIREWALL" FUNCTION ===
-- This function is the ONLY allowed way to check group membership in policies.
-- It is SECURITY DEFINER, meaning it bypasses all RLS checks when running.
CREATE OR REPLACE FUNCTION public.check_group_access_v8(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  -- Safe check: If group_id is null, we can't be a member
  IF _group_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$;

ALTER FUNCTION public.check_group_access_v8(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_group_access_v8(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_access_v8(UUID) TO service_role;

-- === STEP 4: CREATE FRESH, SIMPLE POLICIES ===

-- 4.1 MESSAGES (The source of your errors)
-- Direct Messages: strict check, NO functions
CREATE POLICY "dm_select_v8"
  ON public.messages FOR SELECT
  USING (
    group_id IS NULL 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "dm_insert_v8"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NULL 
    AND sender_id = auth.uid()
  );

-- Group Messages: use the firewall function
CREATE POLICY "group_msg_select_v8"
  ON public.messages FOR SELECT
  USING (
    group_id IS NOT NULL 
    AND check_group_access_v8(group_id)
  );

CREATE POLICY "group_msg_insert_v8"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL 
    AND sender_id = auth.uid()
    AND check_group_access_v8(group_id)
  );

-- 4.2 GROUPS
CREATE POLICY "group_select_v8"
  ON public.groups FOR SELECT
  USING (
    created_by = auth.uid() OR 
    check_group_access_v8(id)
  );

CREATE POLICY "group_insert_v8"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "group_update_v8"
  ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- 4.3 GROUP MEMBERS
-- I can see myself OR I can see members of groups I belong to
CREATE POLICY "member_select_v8"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR 
    check_group_access_v8(group_id)
  );

-- I can add members if I own the group
CREATE POLICY "member_insert_v8"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );

CREATE POLICY "member_delete_v8"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );
