-- Fix Chat System Errors (Recursive Policies & Permissions)
-- Run this script in Supabase SQL Editor to resolve net::ERR_ABORTED errors

-- 1. Reset Function with Correct Ownership (Crucial for bypassing RLS)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER -- Runs with owner privileges
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

-- Ensure the function is owned by postgres (superuser) to truly bypass RLS
ALTER FUNCTION public.is_group_member(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO service_role;

-- 2. Reset Groups Policies
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Groups are viewable by members" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;

CREATE POLICY "Groups are viewable by members"
  ON public.groups FOR SELECT
  USING (
    auth.uid() = created_by OR 
    is_group_member(id)
  );

CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = created_by);

-- 3. Reset Group Members Policies
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view other members in same group" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.group_members;

-- Use a direct check for own membership to avoid recursion in simple cases
CREATE POLICY "Members can view other members in same group"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_group_member(group_id)
  );

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- 4. Reset Messages Policies (The source of ERR_ABORTED)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

-- Optimized Policy: Direct subquery for group check to minimize function overhead
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid() OR
    (
      group_id IS NOT NULL AND 
      is_group_member(group_id)
    )
  );

CREATE POLICY "Users can insert their own messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    (
      (group_id IS NULL) OR
      (group_id IS NOT NULL AND is_group_member(group_id))
    )
  );
