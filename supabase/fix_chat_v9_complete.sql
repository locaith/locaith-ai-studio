-- FIX CHAT SYSTEM V9 (FINAL & COMPLETE)
-- Purpose: Resolve infinite recursion and net::ERR_ABORTED in Supabase.
-- Strategy: Clean cleanup, Indexes for performance, and Simplified Policies.

-- === PART 1: CLEANUP (Explicit Drops) ===
-- We drop every possible policy name from previous versions to ensure no conflicts.

-- Messages Table
DROP POLICY IF EXISTS "Direct messages access" ON public.messages;
DROP POLICY IF EXISTS "Direct messages access_v6" ON public.messages;
DROP POLICY IF EXISTS "dm_access_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "dm_select_v8" ON public.messages;
DROP POLICY IF EXISTS "Direct messages insert" ON public.messages;
DROP POLICY IF EXISTS "Direct messages insert_v6" ON public.messages;
DROP POLICY IF EXISTS "dm_insert_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "dm_insert_v8" ON public.messages;
DROP POLICY IF EXISTS "Group messages access" ON public.messages;
DROP POLICY IF EXISTS "Group messages access_v6" ON public.messages;
DROP POLICY IF EXISTS "group_msg_access_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "group_msg_select_v8" ON public.messages;
DROP POLICY IF EXISTS "Group messages insert" ON public.messages;
DROP POLICY IF EXISTS "Group messages insert_v6" ON public.messages;
DROP POLICY IF EXISTS "group_msg_insert_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "group_msg_insert_v8" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

-- Groups Table
DROP POLICY IF EXISTS "Groups select" ON public.groups;
DROP POLICY IF EXISTS "Groups select_v6" ON public.groups;
DROP POLICY IF EXISTS "group_select_policy_v7" ON public.groups;
DROP POLICY IF EXISTS "group_select_v8" ON public.groups;
DROP POLICY IF EXISTS "Groups insert" ON public.groups;
DROP POLICY IF EXISTS "Groups insert_v6" ON public.groups;
DROP POLICY IF EXISTS "group_insert_policy_v7" ON public.groups;
DROP POLICY IF EXISTS "group_insert_v8" ON public.groups;
DROP POLICY IF EXISTS "Groups update" ON public.groups;
DROP POLICY IF EXISTS "Groups update_v6" ON public.groups;
DROP POLICY IF EXISTS "group_update_policy_v7" ON public.groups;
DROP POLICY IF EXISTS "group_update_v8" ON public.groups;

-- Group Members Table
DROP POLICY IF EXISTS "Group members select" ON public.group_members;
DROP POLICY IF EXISTS "Group members select_v6" ON public.group_members;
DROP POLICY IF EXISTS "member_select_policy_v7" ON public.group_members;
DROP POLICY IF EXISTS "member_select_v8" ON public.group_members;
DROP POLICY IF EXISTS "Group members insert" ON public.group_members;
DROP POLICY IF EXISTS "Group members insert_v6" ON public.group_members;
DROP POLICY IF EXISTS "member_insert_policy_v7" ON public.group_members;
DROP POLICY IF EXISTS "member_insert_v8" ON public.group_members;
DROP POLICY IF EXISTS "Group members delete" ON public.group_members;
DROP POLICY IF EXISTS "Group members delete_v6" ON public.group_members;
DROP POLICY IF EXISTS "member_delete_policy_v7" ON public.group_members;
DROP POLICY IF EXISTS "member_delete_v8" ON public.group_members;

-- Drop Functions (Cascade to kill any lingering dependencies)
DROP FUNCTION IF EXISTS public.is_group_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v7(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v8(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v9(uuid) CASCADE;

-- === PART 2: OPTIMIZATION (Indexes) ===
-- Adding indexes prevents timeouts on large queries
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON public.group_members(user_id, group_id);

-- === PART 3: SECURITY FUNCTION ===
-- This function runs as the Database Owner (postgres), bypassing RLS.
CREATE OR REPLACE FUNCTION public.check_group_access_v9(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  -- Validate input
  IF _group_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check membership directly from table
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = (select auth.uid())
  );
END;
$$;

ALTER FUNCTION public.check_group_access_v9(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_group_access_v9(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_access_v9(UUID) TO service_role;

-- === PART 4: POLICIES ===

-- 4.1 MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Direct Messages (Optimized)
CREATE POLICY "v9_dm_select"
  ON public.messages FOR SELECT
  USING (
    group_id IS NULL 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "v9_dm_insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NULL 
    AND sender_id = auth.uid()
  );

-- Group Messages (Using Secure Function)
CREATE POLICY "v9_group_msg_select"
  ON public.messages FOR SELECT
  USING (
    group_id IS NOT NULL 
    AND check_group_access_v9(group_id)
  );

CREATE POLICY "v9_group_msg_insert"
  ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL 
    AND sender_id = auth.uid()
    AND check_group_access_v9(group_id)
  );

-- 4.2 GROUPS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v9_groups_select"
  ON public.groups FOR SELECT
  USING (
    created_by = auth.uid() OR 
    check_group_access_v9(id)
  );

CREATE POLICY "v9_groups_insert"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "v9_groups_update"
  ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- 4.3 GROUP MEMBERS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- View Members: I can see myself OR I can see others in my groups
CREATE POLICY "v9_members_select"
  ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() OR 
    check_group_access_v9(group_id)
  );

-- Add Members: I can join OR I can add if I am the group creator
CREATE POLICY "v9_members_insert"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );

-- Remove Members: I can leave OR I can remove if I am the group creator
CREATE POLICY "v9_members_delete"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
  );
