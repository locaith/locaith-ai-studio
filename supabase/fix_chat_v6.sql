-- FIX CHAT SYSTEM V6 (ABSOLUTE FINAL FIX)
-- Reason: Previous fixes might have failed due to "Cannot drop function" errors or stuck policies.
-- Solution: Create a NEW function with a NEW name to guarantee a clean slate.

-- 1. Drop ALL existing policies on relevant tables to ensure no conflict
DROP POLICY IF EXISTS "Direct messages access" ON public.messages;
DROP POLICY IF EXISTS "Direct messages insert" ON public.messages;
DROP POLICY IF EXISTS "Group messages access" ON public.messages;
DROP POLICY IF EXISTS "Group messages insert" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "View messages." ON public.messages;

DROP POLICY IF EXISTS "Groups select" ON public.groups;
DROP POLICY IF EXISTS "Groups insert" ON public.groups;
DROP POLICY IF EXISTS "Groups update" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups." ON public.groups;

DROP POLICY IF EXISTS "Group members select" ON public.group_members;
DROP POLICY IF EXISTS "Group members insert" ON public.group_members;
DROP POLICY IF EXISTS "Group members delete" ON public.group_members;
DROP POLICY IF EXISTS "Users can view members." ON public.group_members;

-- 2. Create a NEW SECURITY DEFINER function with a different name
-- This bypasses the "Cannot drop function" error if the old one is stuck
CREATE OR REPLACE FUNCTION public.check_group_access(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- This function runs with the privileges of the owner (postgres), bypassing RLS
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$;

-- Grant permissions for the new function
ALTER FUNCTION public.check_group_access(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_group_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_access(UUID) TO service_role;

-- 3. Create NEW Policies using the NEW function

-- === GROUP MEMBERS ===
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members select_v6"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    check_group_access(group_id)
  );

CREATE POLICY "Group members insert_v6"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );

CREATE POLICY "Group members delete_v6"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );

-- === GROUPS ===
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups select_v6"
  ON public.groups FOR SELECT
  USING (
    created_by = auth.uid() OR 
    check_group_access(id)
  );

CREATE POLICY "Groups insert_v6"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Groups update_v6"
  ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- === MESSAGES ===
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Direct Messages (Optimized: No function call needed)
CREATE POLICY "Direct messages access_v6"
  ON public.messages FOR SELECT
  USING (
    group_id IS NULL 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "Direct messages insert_v6"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NULL 
    AND sender_id = auth.uid()
  );

-- Group Messages (Uses the NEW safe function)
CREATE POLICY "Group messages access_v6"
  ON public.messages FOR SELECT
  USING (
    group_id IS NOT NULL 
    AND check_group_access(group_id)
  );

CREATE POLICY "Group messages insert_v6"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL 
    AND sender_id = auth.uid()
    AND check_group_access(group_id)
  );
