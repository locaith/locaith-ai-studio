-- Reset RLS policies for Chat System to fix recursion and access issues

-- 1. Helper function to check group membership without triggering recursion
-- This function uses SECURITY DEFINER to bypass RLS on group_members when called
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
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

-- 2. Groups Table Policies
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Groups are viewable by members" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;

-- Allow members to view groups they belong to
CREATE POLICY "Groups are viewable by members"
  ON public.groups FOR SELECT
  USING (
    auth.uid() = created_by OR 
    is_group_member(id)
  );

-- Allow authenticated users to create groups
CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Allow admins (creators) to update groups
CREATE POLICY "Group admins can update groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = created_by);

-- 3. Group Members Table Policies
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view other members in same group" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.group_members;

-- Allow users to view members of groups they are in
CREATE POLICY "Members can view other members in same group"
  ON public.group_members FOR SELECT
  USING (
    -- User can see their own membership
    user_id = auth.uid() OR
    -- Or if they are a member of the group, they can see others
    is_group_member(group_id)
  );

-- Allow users to add themselves (join) or be added by creators
CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- 4. Messages Table Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

-- Comprehensive select policy
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (
    -- Direct messages (sender or receiver)
    sender_id = auth.uid() OR
    receiver_id = auth.uid() OR
    -- Group messages (if member of the group)
    (group_id IS NOT NULL AND is_group_member(group_id))
  );

-- Insert policy
CREATE POLICY "Users can insert their own messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    (
        -- Direct message
        (group_id IS NULL) OR
        -- Group message (must be member)
        (group_id IS NOT NULL AND is_group_member(group_id))
    )
  );
