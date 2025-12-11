-- FIX CHAT SYSTEM V3 (Final attempt to resolve ERR_ABORTED)
-- 1. Drop everything first to ensure clean state
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Direct messages access" ON public.messages;
DROP POLICY IF EXISTS "Group messages access" ON public.messages;
DROP POLICY IF EXISTS "Direct messages insert" ON public.messages;
DROP POLICY IF EXISTS "Group messages insert" ON public.messages;

DROP POLICY IF EXISTS "Groups are viewable by members" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;

DROP POLICY IF EXISTS "Members can view other members in same group" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.group_members;

DROP FUNCTION IF EXISTS public.is_group_member(_group_id UUID);

-- 2. Re-create Function with STRICT Security Definer
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER -- IMPORTANT: Runs as the creator (postgres)
SET search_path = public -- IMPORTANT: Prevents search_path hijacking
AS $$
BEGIN
  -- Direct check on group_members. 
  -- Since this runs as SECURITY DEFINER (postgres), it BYPASSES RLS on group_members.
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$;

-- Ensure ownership and permissions
ALTER FUNCTION public.is_group_member(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO service_role;

-- 3. Messages Policies - SPLIT into Direct and Group to isolate issues
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3a. Direct Messages (No function call, pure SQL)
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

-- 3b. Group Messages (Uses function)
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

-- 4. Groups Policies
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

-- 5. Group Members Policies
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Simple policy for members: You can see rows if you are the user OR if you are in the group
-- Note: This calls is_group_member. 
-- Recursion check: 
-- User SELECTs group_members -> Policy calls is_group_member() -> Function (as postgres) SELECTs group_members -> Postgres BYPASSES RLS -> Returns result.
-- NO RECURSION should occur.
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
