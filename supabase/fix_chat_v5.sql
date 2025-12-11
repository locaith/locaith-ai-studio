-- FIX CHAT SYSTEM V5 (Final Absolute Fix)
-- This script does the following:
-- 1. DROPS everything related to RLS policies to start fresh.
-- 2. Defines a simple, non-recursive RLS strategy.
-- 3. USES DIRECT SQL in policies where possible to avoid function overhead.

-- === STEP 1: DROP OLD POLICIES & FUNCTION ===

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

-- Update function to be absolutely safe (SECURITY DEFINER + search_path)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Simple existence check running as superuser/owner
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$;

ALTER FUNCTION public.is_group_member(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO service_role;

-- === STEP 2: CREATE NEW POLICIES ===

-- 1. GROUP MEMBERS (The base)
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Allow users to see:
-- 1. Their own membership rows (Direct check, no recursion)
-- 2. Rows of other members IN THE SAME GROUP (Recursion protected by SECURITY DEFINER function)
CREATE POLICY "Group members select"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_group_member(group_id)
  );

-- Allow users to join groups (if they are the user) or add members (if they created the group)
CREATE POLICY "Group members insert"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );

CREATE POLICY "Group members delete"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );

-- 2. GROUPS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Allow users to see groups they created OR groups they are a member of
CREATE POLICY "Groups select"
  ON public.groups FOR SELECT
  USING (
    created_by = auth.uid() OR 
    is_group_member(id)
  );

CREATE POLICY "Groups insert"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Groups update"
  ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- 3. MESSAGES (The source of ERR_ABORTED)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Direct Messages: Pure SQL, no function calls. Safe.
CREATE POLICY "Direct messages access"
  ON public.messages FOR SELECT
  USING (
    group_id IS NULL 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "Direct messages insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NULL 
    AND sender_id = auth.uid()
  );

-- Group Messages: Uses SECURITY DEFINER function. Safe.
CREATE POLICY "Group messages access"
  ON public.messages FOR SELECT
  USING (
    group_id IS NOT NULL 
    AND is_group_member(group_id)
  );

CREATE POLICY "Group messages insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL 
    AND sender_id = auth.uid()
    AND is_group_member(group_id)
  );
