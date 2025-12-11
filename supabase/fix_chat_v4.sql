-- FIX CHAT SYSTEM V4 (Fix "Cannot drop function" error)
-- This script updates the function in-place (preserving dependencies) and removes specific old policies.

-- 1. UPDATE Function to be SECURITY DEFINER (In-place update, NO DROP)
-- This fixes the recursion issue for all existing policies immediately.
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER -- Runs as postgres to bypass RLS
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$;

-- Ensure permissions
ALTER FUNCTION public.is_group_member(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO service_role;

-- 2. Clean up OLD Policies (Using names from your error log + previous guesses)
-- Messages
DROP POLICY IF EXISTS "View messages." ON public.messages; -- From error log
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Direct messages access" ON public.messages;
DROP POLICY IF EXISTS "Group messages access" ON public.messages;
DROP POLICY IF EXISTS "Direct messages insert" ON public.messages;
DROP POLICY IF EXISTS "Group messages insert" ON public.messages;

-- Groups
DROP POLICY IF EXISTS "Users can view groups." ON public.groups; -- From error log
DROP POLICY IF EXISTS "Groups are viewable by members" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
DROP POLICY IF EXISTS "Groups select" ON public.groups;
DROP POLICY IF EXISTS "Groups insert" ON public.groups;
DROP POLICY IF EXISTS "Groups update" ON public.groups;

-- Group Members
DROP POLICY IF EXISTS "Users can view members." ON public.group_members; -- From error log
DROP POLICY IF EXISTS "Members can view other members in same group" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Group members select" ON public.group_members;
DROP POLICY IF EXISTS "Group members insert" ON public.group_members;
DROP POLICY IF EXISTS "Group members delete" ON public.group_members;

-- Note: We do NOT drop "View appointments." policy. 
-- It will automatically use the updated SECURITY DEFINER function, which fixes it too.

-- 3. Create NEW Optimized Policies

-- 3a. Messages (Split for performance and safety)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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

-- 3b. Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

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

-- 3c. Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members select"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_group_member(group_id)
  );

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
