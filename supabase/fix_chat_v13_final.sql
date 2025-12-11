-- FIX CHAT SYSTEM V13 (FINAL NUCLEAR FIX)
-- Script này là phiên bản nâng cấp của V12, đảm bảo xóa sạch policy cũ và tạo lại policy tối ưu nhất.
-- Đã thêm hàm get_my_group_ids để xử lý triệt để recursion.

-- ==========================================
-- PHẦN 1: DỌN DẸP SẠCH SẼ (NUCLEAR OPTION)
-- ==========================================

DO $$ 
DECLARE 
  r RECORD; 
BEGIN 
  -- 1. Xóa tất cả Policy trên các bảng liên quan
  FOR r IN (
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('messages', 'groups', 'group_members')
  ) LOOP 
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename; 
  END LOOP;
END $$;

-- 2. Xóa function cũ (Cascade để xóa dependency)
DROP FUNCTION IF EXISTS public.check_group_access_v12(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v11(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v10(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v9(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v8(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v7(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_group_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_group_ids() CASCADE;

-- ==========================================
-- PHẦN 2: CẤU TRÚC & INDEX (OPTIMIZATION)
-- ==========================================

-- Tạo Index để tăng tốc query
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON public.group_members(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON public.group_members(group_id, user_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PHẦN 3: HÀM BẢO MẬT (SECURITY DEFINER)
-- ==========================================

-- Hàm 1: Lấy danh sách ID các nhóm mà user tham gia
-- SECURITY DEFINER: Chạy quyền admin, bỏ qua RLS của bảng group_members
CREATE OR REPLACE FUNCTION public.get_my_group_ids()
RETURNS TABLE (group_id UUID) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY 
  SELECT gm.group_id 
  FROM public.group_members gm 
  WHERE gm.user_id = (select auth.uid());
END;
$$;

-- Hàm 2: Kiểm tra quyền truy cập 1 nhóm cụ thể
CREATE OR REPLACE FUNCTION public.check_group_access_v13(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  IF _group_id IS NULL THEN 
    RETURN FALSE; 
  END IF;
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members
    WHERE group_id = _group_id 
    AND user_id = (select auth.uid())
  );
END;
$$;

-- Cấp quyền execute
GRANT EXECUTE ON FUNCTION public.get_my_group_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_group_ids() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_group_access_v13(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_access_v13(UUID) TO service_role;

-- ==========================================
-- PHẦN 4: CHÍNH SÁCH MỚI (FINAL POLICIES)
-- ==========================================

-- 4.1. MESSAGES
-- Chat cá nhân: Sender hoặc Receiver
CREATE POLICY "v13_dm_select" ON public.messages FOR SELECT
  USING (
    group_id IS NULL 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "v13_dm_insert" ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NULL 
    AND sender_id = auth.uid()
  );

-- Chat nhóm: Dùng hàm Security Definer check_group_access_v13
CREATE POLICY "v13_group_msg_select" ON public.messages FOR SELECT
  USING (
    group_id IS NOT NULL 
    AND check_group_access_v13(group_id)
  );

CREATE POLICY "v13_group_msg_insert" ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL 
    AND sender_id = auth.uid() 
    AND check_group_access_v13(group_id)
  );

-- 4.2. GROUPS
-- Xem: Người tạo OR nằm trong danh sách nhóm tham gia (dùng hàm get_my_group_ids)
CREATE POLICY "v13_groups_select" ON public.groups FOR SELECT
  USING (
    created_by = auth.uid() 
    OR id IN (SELECT group_id FROM get_my_group_ids())
  );

CREATE POLICY "v13_groups_insert" ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "v13_groups_update" ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- 4.3. GROUP MEMBERS
-- Xem: Chính mình OR thành viên trong nhóm mình tham gia
CREATE POLICY "v13_members_select" ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() 
    OR group_id IN (SELECT group_id FROM get_my_group_ids())
  );

-- Insert/Delete: Owner hoặc tự mình
CREATE POLICY "v13_members_insert" ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "v13_members_delete" ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );
