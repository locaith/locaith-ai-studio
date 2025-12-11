-- FIX CHAT SYSTEM V12 (NUCLEAR CLEANUP & REBUILD)
-- Script này tự động tìm và xóa TOÀN BỘ policy cũ, sau đó tạo lại từ đầu.
-- Giải quyết triệt để lỗi "Policy already exists" và "Recursion".

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
DROP FUNCTION IF EXISTS public.check_group_access_v11(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v10(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v9(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v8(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access_v7(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_group_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_group_member(uuid) CASCADE;

-- ==========================================
-- PHẦN 2: CẤU TRÚC & INDEX (OPTIMIZATION)
-- ==========================================

-- Tạo Index để tăng tốc query (tránh timeout)
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON public.group_members(user_id, group_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PHẦN 3: HÀM BẢO MẬT (SECURITY DEFINER)
-- ==========================================

-- Hàm này chạy với quyền Admin (SECURITY DEFINER) để tránh RLS loop
CREATE OR REPLACE FUNCTION public.check_group_access_v12(_group_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  -- Nếu không có group_id, trả về false
  IF _group_id IS NULL THEN 
    RETURN FALSE; 
  END IF;
  
  -- Kiểm tra xem user hiện tại có trong bảng members không
  -- Vì chạy quyền Admin nên nó đọc được bảng group_members bất chấp RLS
  RETURN EXISTS (
    SELECT 1 
    FROM public.group_members
    WHERE group_id = _group_id 
    AND user_id = (select auth.uid())
  );
END;
$$;

-- Cấp quyền execute
ALTER FUNCTION public.check_group_access_v12(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_group_access_v12(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_group_access_v12(UUID) TO service_role;

-- ==========================================
-- PHẦN 4: CHÍNH SÁCH MỚI (SIMPLIFIED)
-- ==========================================

-- 4.1. MESSAGES
-- Chat cá nhân: Người gửi OR Người nhận
CREATE POLICY "v12_dm_select" ON public.messages FOR SELECT
  USING (
    group_id IS NULL 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "v12_dm_insert" ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NULL 
    AND sender_id = auth.uid()
  );

-- Chat nhóm: Dùng hàm Security Definer
CREATE POLICY "v12_group_msg_select" ON public.messages FOR SELECT
  USING (
    group_id IS NOT NULL 
    AND check_group_access_v12(group_id)
  );

CREATE POLICY "v12_group_msg_insert" ON public.messages FOR INSERT
  WITH CHECK (
    group_id IS NOT NULL 
    AND sender_id = auth.uid() 
    AND check_group_access_v12(group_id)
  );

-- 4.2. GROUPS
-- Xem: Người tạo OR Thành viên (dùng hàm Security Definer)
CREATE POLICY "v12_groups_select" ON public.groups FOR SELECT
  USING (
    created_by = auth.uid() 
    OR check_group_access_v12(id)
  );

CREATE POLICY "v12_groups_insert" ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "v12_groups_update" ON public.groups FOR UPDATE
  USING (created_by = auth.uid());

-- 4.3. GROUP MEMBERS
-- Xem: Chính mình OR Thành viên cùng nhóm
CREATE POLICY "v12_members_select" ON public.group_members FOR SELECT
  USING (
    user_id = auth.uid() -- Xem chính mình
    OR check_group_access_v12(group_id) -- Xem thành viên trong nhóm mình tham gia
  );

-- Thêm thành viên: Chỉ người tạo nhóm mới được thêm (đơn giản hóa)
-- Hoặc cho phép tự thêm mình (join)
CREATE POLICY "v12_members_insert" ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() -- Tự join (nếu logic app cho phép)
    OR EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id 
      AND created_by = auth.uid() -- Owner add
    )
  );

-- Rời nhóm / Xóa thành viên
CREATE POLICY "v12_members_delete" ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() -- Tự rời
    OR EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id 
      AND created_by = auth.uid() -- Owner kick
    )
  );
