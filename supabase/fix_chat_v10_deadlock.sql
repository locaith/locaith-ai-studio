-- FIX CHAT SYSTEM V10 (DEADLOCK BREAKER)
-- PROBLEM: The app is running and querying the database while you try to change policies.
-- This causes a DEADLOCK (App holds lock, Migration waits for lock, App waits for Migration).
-- SOLUTION: Kill active connections to these tables first, then apply the fix.

-- === STEP 1: KILL ACTIVE CONNECTIONS (The "Unplug it" approach) ===
-- This terminates any running queries on our chat tables to free up locks.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT pid 
        FROM pg_stat_activity 
        WHERE pid <> pg_backend_pid()
        AND datname = current_database()
        AND state = 'active'
        AND (query ILIKE '%messages%' OR query ILIKE '%groups%' OR query ILIKE '%group_members%')
    LOOP
        PERFORM pg_terminate_backend(r.pid);
    END LOOP;
END $$;

-- === STEP 2: APPLY THE FIX (Same as V9 but now safe from deadlocks) ===

-- 2.1 CLEANUP
DROP POLICY IF EXISTS "Direct messages access" ON public.messages;
DROP POLICY IF EXISTS "Direct messages access_v6" ON public.messages;
DROP POLICY IF EXISTS "dm_access_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "dm_select_v8" ON public.messages;
DROP POLICY IF EXISTS "v9_dm_select" ON public.messages;
DROP POLICY IF EXISTS "Direct messages insert" ON public.messages;
DROP POLICY IF EXISTS "Direct messages insert_v6" ON public.messages;
DROP POLICY IF EXISTS "dm_insert_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "dm_insert_v8" ON public.messages;
DROP POLICY IF EXISTS "v9_dm_insert" ON public.messages;
DROP POLICY IF EXISTS "Group messages access" ON public.messages;
DROP POLICY IF EXISTS "Group messages access_v6" ON public.messages;
DROP POLICY IF EXISTS "group_msg_access_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "group_msg_select_v8" ON public.messages;
DROP POLICY IF EXISTS "v9_group_msg_select" ON public.messages;
DROP POLICY IF EXISTS "Group messages insert" ON public.messages;
DROP POLICY IF EXISTS "Group messages insert_v6" ON public.messages;
DROP POLICY IF EXISTS "group_msg_insert_policy_v7" ON public.messages;
DROP POLICY IF EXISTS "group_msg_insert_v8" ON public.messages;
DROP POLICY IF EXISTS "v9_group_msg_insert" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

DROP POLICY IF EXISTS "Groups select" ON public.groups;
DROP POLICY IF EXISTS "v9_groups_select" ON public.groups;
DROP POLICY IF EXISTS "Groups insert" ON public.groups;
DROP POLICY IF EXISTS "v9_groups_insert" ON public.groups;
DROP POLICY IF EXISTS "Groups update" ON public.groups;
DROP POLICY IF EXISTS "v9_groups_update" ON public.groups;

DROP POLICY IF EXISTS "Group members select" ON public.group_members;
DROP POLICY IF EXISTS "v9_members_select" ON public.group_members;
DROP POLICY IF EXISTS "Group members insert" ON public.group_members;
DROP POLICY IF EXISTS "v9_members_insert" ON public.group_members;
DROP POLICY IF EXISTS "Group members delete" ON public.group_members;
DROP POLICY IF EXISTS "v9_members_delete" ON public.group_members;

-- Drop Functions (Cascade)
DROP FUNCTION IF EXISTS public.is_group_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v7(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v8(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v9(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v10(uuid) CASCADE;

-- 2.2 INDEXES
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON public.group_members(user_id, group_id);

-- 2.3 SECURITY FUNCTION (V10)
CREATE OR REPLACE FUNCTION public.check_group_access_v10(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  IF _group_id IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = (select auth.uid())
  );
END;
$$;

ALTER FUNCTION public.check_group_access_v10(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_group_access_v10(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_access_v10(UUID) TO service_role;

-- 2.4 POLICIES (V10)

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_dm_select" ON public.messages FOR SELECT
  USING (group_id IS NULL AND (sender_id = auth.uid() OR receiver_id = auth.uid()));

CREATE POLICY "v10_dm_insert" ON public.messages FOR INSERT
  WITH CHECK (group_id IS NULL AND sender_id = auth.uid());

CREATE POLICY "v10_group_msg_select" ON public.messages FOR SELECT
  USING (group_id IS NOT NULL AND check_group_access_v10(group_id));

CREATE POLICY "v10_group_msg_insert" ON public.messages FOR INSERT
  WITH CHECK (group_id IS NOT NULL AND sender_id = auth.uid() AND check_group_access_v10(group_id));

-- Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_groups_select" ON public.groups FOR SELECT
  USING (created_by = auth.uid() OR check_group_access_v10(id));

CREATE POLICY "v10_groups_insert" ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "v10_groups_update" ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v10_members_select" ON public.group_members FOR SELECT
  USING (user_id = auth.uid() OR check_group_access_v10(group_id));

CREATE POLICY "v10_members_insert" ON public.group_members FOR INSERT
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid()));

CREATE POLICY "v10_members_delete" ON public.group_members FOR DELETE
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid()));
